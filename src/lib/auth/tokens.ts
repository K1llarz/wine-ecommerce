// JWT helpers shared by the proxy (Node runtime) and server-side session code.
// Kept dependency-light (only `jose`, which runs in every runtime) and free of
// `server-only`/Prisma imports so it can be used from `src/proxy.ts`.

import { SignJWT, jwtVerify } from "jose";
import { USER_ROLES, type UserRole } from "@/lib/constants";

/** httpOnly cookie names for the access / refresh tokens. */
export const ACCESS_COOKIE = "mdv_at";
export const REFRESH_COOKIE = "mdv_rt";

/** Lifetimes (seconds) — also used to set cookie `maxAge`. */
export const ACCESS_MAX_AGE = 60 * 60; // 1 hour
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const ACCESS_TTL = "1h";
const REFRESH_TTL = "30d";

/** The minimal, signed identity we trust from a token without a DB lookup. */
export type SessionClaims = {
  sub: string; // user id
  email: string;
  role: UserRole;
  name: string | null;
};

function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(value);
}

async function sign(claims: SessionClaims, ttl: string, typ: string): Promise<string> {
  return new SignJWT({ email: claims.email, role: claims.role, name: claims.name, typ })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

export function signAccessToken(claims: SessionClaims): Promise<string> {
  return sign(claims, ACCESS_TTL, "access");
}

export function signRefreshToken(claims: SessionClaims): Promise<string> {
  return sign(claims, REFRESH_TTL, "refresh");
}

/** Verify a token and return trusted claims, or `null` if invalid/expired. */
export async function verifyToken(
  token: string | undefined | null,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role ?? "");
    if (!payload.sub || !USER_ROLES.includes(role as UserRole)) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      role: role as UserRole,
      name: payload.name == null ? null : String(payload.name),
    };
  } catch {
    return null;
  }
}
