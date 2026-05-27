import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AgeGate } from "@/components/site/age-gate";
import { getCurrentUser } from "@/lib/auth/session";

export default async function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader
        user={
          user
            ? { name: user.name, email: user.email, role: user.role }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AgeGate />
    </>
  );
}
