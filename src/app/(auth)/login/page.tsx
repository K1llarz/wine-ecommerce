import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, isAdminRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Maison du Vin account.",
};

function safePath(value: string | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = safePath(sp.redirect);
  const forbidden = sp.error === "forbidden";

  const user = await getCurrentUser();
  if (user) {
    redirect(forbidden ? "/account" : (redirectTo ?? (isAdminRole(user.role) ? "/admin" : "/account")));
  }

  return (
    <div className="flex flex-col gap-4">
      <AuthForm mode="login" redirectTo={redirectTo} forbidden={forbidden} />
      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">Demo accounts</p>
        <p>
          Admin — <span className="font-mono">admin@maisonduvin.test</span> /{" "}
          <span className="font-mono">admin1234</span>
        </p>
        <p>
          Customer — <span className="font-mono">customer@example.com</span> /{" "}
          <span className="font-mono">password1234</span>
        </p>
      </div>
    </div>
  );
}
