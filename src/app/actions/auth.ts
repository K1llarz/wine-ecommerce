"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, isAdminRole } from "@/lib/auth/session";

export type AuthResult = { ok: false; message: string } | null;

/** Only allow same-origin, absolute internal paths as redirect targets. */
function safeRedirect(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function destinationFor(role: string, requested: string | null): string {
  if (requested) return requested;
  return isAdminRole(role) ? "/admin" : "/account";
}

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long."),
});

export async function signupAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, message: "An account with that email already exists." };
  }

  const user = await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      role: "CUSTOMER",
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await createSession(user);
  redirect(destinationFor(user.role, safeRedirect(formData.get("redirectTo"))));
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export async function loginAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  // Always run a compare to keep timing roughly constant even when the user
  // doesn't exist or is OAuth-only (no password hash).
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const valid = await verifyPassword(parsed.data.password, hash);
  if (!user || !user.passwordHash || !valid) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createSession(user);
  redirect(destinationFor(user.role, safeRedirect(formData.get("redirectTo"))));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
