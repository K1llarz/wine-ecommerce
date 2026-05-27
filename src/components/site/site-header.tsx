"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, mainNav } from "@/lib/site";
import { ADMIN_ROLES, type UserRole } from "@/lib/constants";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { CartBadge } from "@/components/site/cart-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type HeaderUser = {
  name: string | null;
  email: string;
  role: string;
};

function isAdmin(role: string) {
  return ADMIN_ROLES.includes(role as UserRole);
}

export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const admin = !!user && isAdmin(user.role);

  const iconLinks = (
    <>
      <ButtonLink href="/wines" aria-label="Search wines" variant="ghost" size="icon">
        <Search className="size-5" />
      </ButtonLink>
      <ButtonLink
        href="/account/wishlist"
        aria-label="Wishlist"
        variant="ghost"
        size="icon"
      >
        <Heart className="size-5" />
      </ButtonLink>
      <ButtonLink
        href={user ? "/account" : "/login"}
        aria-label={user ? "Your account" : "Sign in"}
        variant="ghost"
        size="icon"
      >
        <User className="size-5" />
      </ButtonLink>
      {user ? (
        <form action={logoutAction}>
          <Button type="submit" aria-label="Sign out" variant="ghost" size="icon">
            <LogOut className="size-5" />
          </Button>
        </form>
      ) : null}
      <ButtonLink
        href="/cart"
        aria-label="Cart"
        variant="ghost"
        size="icon"
        className="relative"
      >
        <ShoppingBag className="size-5" />
        <CartBadge />
      </ButtonLink>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="bg-burgundy py-2 text-center text-xs tracking-[0.18em] text-primary-foreground uppercase">
        Complimentary shipping on orders over $150
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <div className="flex items-center md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-lg">{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-2">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {admin ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-burgundy hover:bg-accent"
                  >
                    Admin dashboard
                  </Link>
                ) : null}
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      Your account
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-accent"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      Create account
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Brand */}
        <Link href="/" className="flex flex-col items-center md:items-start">
          <span className="font-heading text-2xl leading-none font-semibold">
            {siteConfig.name}
          </span>
          <span className="hidden text-[0.6rem] tracking-[0.25em] text-muted-foreground uppercase md:block">
            {siteConfig.tagline}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => {
            const active =
              item.href === pathname ||
              (item.href.startsWith("/wines") && pathname === "/wines");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-burgundy",
                  active ? "text-burgundy" : "text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-0.5">
          {admin ? (
            <ButtonLink
              href="/admin"
              variant="ghost"
              size="sm"
              className="mr-1 hidden gap-1.5 text-burgundy lg:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              Admin
            </ButtonLink>
          ) : null}
          {iconLinks}
        </div>
      </div>
    </header>
  );
}
