"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 15000; // $150 in cents
const FLAT_SHIPPING = 1500; // $15 in cents

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  if (!hydrated) {
    return <div className="py-24 text-center text-muted-foreground">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-24 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 font-heading text-2xl">Your cart is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover something remarkable from our cellar.
        </p>
        <ButtonLink href="/wines" className="mt-6 h-11 px-6">
          Browse wines
        </ButtonLink>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 py-5">
            <Link
              href={`/products/${item.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-heading text-lg leading-snug font-medium hover:text-burgundy"
                >
                  {item.name}
                </Link>
                <span className="font-medium">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
              <span className="mt-0.5 text-sm text-muted-foreground">
                {formatPrice(item.priceCents)} each
              </span>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-md border border-border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => remove(item.productId)}
                >
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <aside className="h-fit rounded-lg border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-semibold">Order summary</h2>
        <Separator className="my-4" />
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd>
          </div>
          {shipping > 0 && (
            <p className="text-xs text-muted-foreground">
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for
              complimentary shipping.
            </p>
          )}
        </dl>
        <Separator className="my-4" />
        <div className="flex justify-between font-heading text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Button disabled className="mt-6 h-11 w-full px-6 text-base">
          Secure checkout — coming soon
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Taxes calculated at checkout. Age verification required on delivery.
        </p>
      </aside>
    </div>
  );
}
