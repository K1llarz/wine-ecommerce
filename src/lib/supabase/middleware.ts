import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase auth session fresh. Reads the auth cookies from the
 * request, calls `getUser()` (which rotates the access token when it is near
 * expiry), and writes any updated cookies onto the response it returns so the
 * caller (proxy.ts) can forward or copy them to the browser.
 *
 * Note: there must be no logic between `createServerClient` and `getUser()` —
 * doing so risks logging users out at random (per the Supabase SSR guide).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // No-op when Supabase isn't configured so the app keeps working without it.
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh the session. Don't insert code between this and createServerClient.
  // Guard against transient network/Supabase errors so a failed refresh can't
  // take down every page — the app's own auth guards still apply downstream.
  try {
    await supabase.auth.getUser();
  } catch {
    // ignore — return the response with whatever cookies are already set
  }

  return supabaseResponse;
}
