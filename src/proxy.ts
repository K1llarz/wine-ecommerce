import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  signAccessToken,
  verifyToken,
} from "@/lib/auth/tokens";
import { ADMIN_ROLES, type UserRole } from "@/lib/constants";

// Guard the authenticated areas. Everything else (storefront, auth pages,
// static assets) is public and skipped for performance.
export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};

function loginRedirect(request: NextRequest, search: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = search;
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Trust the short-lived access token; if it is missing/expired, fall back to
  // the refresh token and silently mint a new access cookie on the response.
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
    return loginRedirect(request, `?redirect=${encodeURIComponent(pathname)}`);
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(claims.role as UserRole)) {
    return loginRedirect(request, "?error=forbidden");
  }

  const response = NextResponse.next();
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
