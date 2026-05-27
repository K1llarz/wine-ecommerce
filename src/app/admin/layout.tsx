import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Maison du Vin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20 md:flex">
      <AdminSidebar
        user={{ name: user.name, email: user.email, role: user.role }}
      />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
