import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ADMIN_ROLES, type UserRole } from "@/lib/constants";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type SessionClaims,
} from "@/lib/auth/tokens";

const isProd = process.env.NODE_ENV === "production";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
};

type SessionInput = {
  id: string;
  email: string;
  role: string;
  name: string | null;
};

/** Issue fresh access + refresh cookies. Call only from Server Actions/Route Handlers. */
export async function createSession(user: SessionInput): Promise<void> {
  const claims: SessionClaims = {
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name,
  };
  const [access, refresh] = await Promise.all([
    signAccessToken(claims),
    signRefreshToken(claims),
  ]);
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refresh, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/**
 * Read trusted claims from the access cookie, falling back to the refresh
 * cookie. The proxy re-issues the access cookie on protected routes; the
 * fallback keeps non-proxied routes (e.g. the storefront header) working when
 * the short-lived access token has expired but the refresh token is still valid.
 */
async function readClaims(): Promise<SessionClaims | null> {
  const store = await cookies();
  const fromAccess = await verifyToken(store.get(ACCESS_COOKIE)?.value);
  if (fromAccess) return fromAccess;
  return verifyToken(store.get(REFRESH_COOKIE)?.value);
}

/**
 * The signed-in user (or null), loaded fresh from the database so role/profile
 * changes take effect immediately. Memoized per request via React `cache`.
 */
export const getCurrentUser = cache(async () => {
  const claims = await readClaims();
  if (!claims) return null;
  return db.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, email: true, name: true, role: true, image: true },
  });
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole);
}

/** Redirect to login if not signed in; otherwise return the user. */
export async function requireUser(redirectTo = "/account"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  return user;
}

/** Require an admin-capable role; redirect otherwise. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!isAdminRole(user.role)) redirect("/login?error=forbidden");
  return user;
}
