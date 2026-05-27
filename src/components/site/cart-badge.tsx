"use client";

import { useCart, cartCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export function CartBadge() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));

  if (!hydrated || count === 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-burgundy px-1 text-[0.65rem] leading-4 font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}
