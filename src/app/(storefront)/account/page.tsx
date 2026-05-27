import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, MapPin, LayoutDashboard } from "lucide-react";
import { requireUser, isAdminRole } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Your account" };

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function AccountPage() {
  const session = await requireUser("/account");
  const [profile, orderCount, wishlistCount, addressCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, role: true, createdAt: true },
    }),
    db.order.count({ where: { userId: session.id } }),
    db.wishlistItem.count({ where: { userId: session.id } }),
    db.address.count({ where: { userId: session.id } }),
  ]);

  const admin = isAdminRole(session.role);
  const firstName = profile?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold sm:text-4xl">
            Welcome back, {firstName}
          </h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      {admin ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sidebar px-5 py-4 text-sidebar-foreground">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-5 text-sidebar-primary" />
            <div>
              <p className="text-sm font-medium">You have administrator access</p>
              <p className="text-xs text-sidebar-foreground/70">
                Manage products, orders, inventory and customers.
              </p>
            </div>
          </div>
          <ButtonLink href="/admin" size="sm" className="bg-sidebar-primary text-sidebar-primary-foreground">
            Open dashboard
          </ButtonLink>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Name" value={profile?.name ?? "—"} />
            <Detail label="Email" value={profile?.email ?? "—"} />
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Role</p>
              <Badge className="mt-1" variant="secondary">
                {roleLabel(profile?.role ?? "CUSTOMER")}
              </Badge>
            </div>
            <Detail
              label="Member since"
              value={
                profile?.createdAt
                  ? profile.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <LinkCard
          href="/account/orders"
          icon={<Package className="size-5" />}
          title="Orders"
          description={orderCount === 1 ? "1 order" : `${orderCount} orders`}
        />
        <LinkCard
          href="/account/wishlist"
          icon={<Heart className="size-5" />}
          title="Wishlist"
          description={wishlistCount === 1 ? "1 saved wine" : `${wishlistCount} saved wines`}
        />
        <LinkCard
          href="/account/addresses"
          icon={<MapPin className="size-5" />}
          title="Addresses"
          description={addressCount === 1 ? "1 address" : `${addressCount} addresses`}
        />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function LinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors hover:ring-burgundy/40">
        <CardContent className="flex items-center gap-4 py-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-burgundy">
            {icon}
          </span>
          <div>
            <p className="font-heading text-base font-medium group-hover:text-burgundy">
              {title}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
