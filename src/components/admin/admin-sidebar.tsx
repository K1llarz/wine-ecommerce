"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Store, LogOut } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type AdminUser = { name: string | null; email: string; role: string };

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SidebarInner({ user, onNavigate }: { user: AdminUser; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/admin" onClick={onNavigate} className="px-2 pt-1">
        <span className="block font-heading text-xl leading-none font-semibold text-sidebar-foreground">
          {siteConfig.name}
        </span>
        <span className="mt-1 block text-[0.6rem] tracking-[0.3em] text-sidebar-foreground/60 uppercase">
          Admin
        </span>
      </Link>

      <AdminNav onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Store className="size-4" />
          View store
        </Link>
        <div className="rounded-lg bg-sidebar-accent/50 p-3">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name ?? "Administrator"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          <p className="mt-1 text-[0.65rem] tracking-wider text-sidebar-primary uppercase">
            {roleLabel(user.role)}
          </p>
          <form action={logoutAction} className="mt-2.5">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border px-3 py-1.5 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarInner user={user} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Link href="/admin" className="font-heading text-lg font-semibold">
          {siteConfig.name}
          <span className="ml-2 text-xs font-normal text-sidebar-foreground/60">Admin</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open admin menu"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SidebarInner user={user} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
