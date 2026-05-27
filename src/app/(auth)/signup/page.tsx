import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, isAdminRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Maison du Vin account.",
};

function safePath(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = safePath(sp.redirect);

  const user = await getCurrentUser();
  if (user) redirect(redirectTo ?? (isAdminRole(user.role) ? "/admin" : "/account"));

  return <AuthForm mode="signup" redirectTo={redirectTo} />;
}
