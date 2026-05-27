import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  signAccessToken,
  verifyToken,
} from "@/lib/auth/tokens";
import { ADMIN_ROLES, type UserRole } from "@/lib/constants";

// Run on every route except Next internals and static assets, so the Supabase
// auth session can be refreshed everywhere. The custom JWT route guards below
// only apply to the authenticated areas (/admin, /account).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|wines/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

function isProtected(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/account");
}

/** Redirect to /login, carrying over any refreshed cookies from `base`. */
function loginRedirect(
  request: NextRequest,
  base: NextResponse,
  search: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = search;
  const redirect = NextResponse.redirect(url);
  for (const cookie of base.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // 1) Keep the Supabase auth session fresh on every matched request. The
  //    returned response carries any rotated Supabase auth cookies.
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) return response;

  // 2) Custom JWT guard for the authenticated areas. Trust the short-lived
  //    access token; fall back to the refresh token and re-issue access.
  let claims = await verifyToken(request.cookies.get(ACCESS_COOKIE)?.value);
  let refreshed: string | null = null;

  if (!claims) {
    const fromRefresh = await verifyToken(request.cookies.get(REFRESH_COOKIE)?.value);
    if (fromRefresh) {
      claims = fromRefresh;
      refreshed = await signAccessToken(fromRefresh);
    }
  }

  if (!claims) {
    return loginRedirect(request, response, `?redirect=${encodeURIComponent(pathname)}`);
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(claims.role as UserRole)) {
    return loginRedirect(request, response, "?error=forbidden");
  }

  if (refreshed) {
    response.cookies.set(ACCESS_COOKIE, refreshed, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ACCESS_MAX_AGE,
    });
  }
  return response;
}
