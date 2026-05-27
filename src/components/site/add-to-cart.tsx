"use client";

import { useState } from "react";
import { Minus, Plus, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartLine } from "@/lib/cart-store";

export function AddToCart({
  line,
  soldOut,
}: {
  line: Omit<CartLine, "quantity">;
  soldOut: boolean;
}) {
  const add = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (soldOut) {
    return (
      <Button disabled className="h-11 w-full px-6 text-base">
        Sold out
      </Button>
    );
  }

  function handleAdd() {
    add(line, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-md border border-border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(line.maxQuantity, q + 1))}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button onClick={handleAdd} className="h-11 flex-1 px-6 text-base sm:flex-none">
        {added ? (
          <>
            <Check className="size-4" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" /> Add to cart
          </>
        )}
      </Button>
    </div>
  );
}
