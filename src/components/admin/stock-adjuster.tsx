"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adjustStockAction, type StockAdjustState } from "@/app/actions/admin-products";
import { INVENTORY_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function ApplyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : "Apply"}
    </Button>
  );
}

export function StockAdjuster({ productId }: { productId: string }) {
  const [state, action] = useActionState<StockAdjustState, FormData>(
    adjustStockAction,
    null,
  );

  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-1.5">
      <input type="hidden" name="productId" value={productId} />
      <Input
        name="change"
        type="number"
        step="1"
        required
        placeholder="±"
        aria-label="Stock change"
        className="h-7 w-16 text-right"
      />
      <Select name="reason" defaultValue="RESTOCK" aria-label="Reason" className="h-7 w-32">
        {INVENTORY_REASONS.map((r) => (
          <option key={r} value={r}>
            {titleCase(r)}
          </option>
        ))}
      </Select>
      <ApplyButton />
      {state ? (
        <span
          className={`w-full text-right text-xs ${
            state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
