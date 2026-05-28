"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { saveProductAction, type ProductFormState } from "@/app/actions/admin-products";
import type { EditProduct } from "@/lib/admin-queries";
import {
  PRODUCT_STATUS,
  WINE_BODY,
  WINE_SWEETNESS,
  WINE_ACIDITY,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Reference = {
  categories: { id: string; name: string }[];
  regions: { id: string; name: string; country: string }[];
  varietals: { id: string; name: string }[];
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5">
        {label}
      </Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function SaveButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Saving…"
        : mode === "create"
          ? "Create product"
          : "Save changes"}
    </Button>
  );
}

export function ProductForm({
  mode,
  product,
  reference,
}: {
  mode: "create" | "edit";
  product?: EditProduct;
  reference: Reference;
}) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    saveProductAction,
    null,
  );

  const dollars = (cents: number | null | undefined) =>
    cents == null ? "" : (cents / 100).toFixed(2);
  const primaryImage =
    product?.images.find((img) => img.isPrimary)?.url ?? product?.images[0]?.url ?? "";
  const selectedVarietals = new Set(product?.varietals.map((v) => v.varietalId) ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {state && !state.ok ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <Section title="Basics">
        <Field label="Name" htmlFor="name" className="sm:col-span-2">
          <Input id="name" name="name" required defaultValue={product?.name} />
        </Field>
        <Field label="SKU" htmlFor="sku">
          <Input id="sku" name="sku" required defaultValue={product?.sku} />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
          <Input id="slug" name="slug" defaultValue={product?.slug} />
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""}>
            <option value="" disabled>
              Select a category…
            </option>
            {reference.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Region" htmlFor="regionId">
          <Select id="regionId" name="regionId" defaultValue={product?.regionId ?? ""}>
            <option value="">— None —</option>
            {reference.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.country})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" htmlFor="description" className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
        </Field>
      </Section>

      <Section title="Provenance & classification">
        <Field label="Producer" htmlFor="producer">
          <Input id="producer" name="producer" defaultValue={product?.producer ?? ""} />
        </Field>
        <Field label="Appellation" htmlFor="appellation">
          <Input id="appellation" name="appellation" defaultValue={product?.appellation ?? ""} />
        </Field>
        <Field label="Country" htmlFor="country">
          <Input id="country" name="country" defaultValue={product?.country ?? ""} />
        </Field>
        <Field label="Vintage" htmlFor="vintage" hint="Leave blank for non-vintage.">
          <Input
            id="vintage"
            name="vintage"
            type="number"
            min={1900}
            max={2100}
            defaultValue={product?.vintage ?? ""}
          />
        </Field>
        <Field label="Alcohol %" htmlFor="alcohol">
          <Input
            id="alcohol"
            name="alcohol"
            type="number"
            step="0.1"
            min={0}
            max={70}
            defaultValue={product?.alcohol ?? ""}
          />
        </Field>
        <Field label="Volume (ml)" htmlFor="volumeMl">
          <Input
            id="volumeMl"
            name="volumeMl"
            type="number"
            min={0}
            defaultValue={product?.volumeMl ?? 750}
          />
        </Field>
        <Field label="Body" htmlFor="body">
          <Select id="body" name="body" defaultValue={product?.body ?? ""}>
            <option value="">—</option>
            {WINE_BODY.map((b) => (
              <option key={b} value={b}>
                {titleCase(b)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sweetness" htmlFor="sweetness">
          <Select id="sweetness" name="sweetness" defaultValue={product?.sweetness ?? ""}>
            <option value="">—</option>
            {WINE_SWEETNESS.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Acidity" htmlFor="acidity">
          <Select id="acidity" name="acidity" defaultValue={product?.acidity ?? ""}>
            <option value="">—</option>
            {WINE_ACIDITY.map((a) => (
              <option key={a} value={a}>
                {titleCase(a)}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Tasting & pairings">
        <Field label="Tasting notes" htmlFor="tastingNotes" className="sm:col-span-2">
          <Textarea id="tastingNotes" name="tastingNotes" defaultValue={product?.tastingNotes ?? ""} />
        </Field>
        <Field
          label="Food pairings"
          htmlFor="foodPairings"
          hint="Separate items with a pipe ( | ), e.g. Grilled steak | Aged cheese"
          className="sm:col-span-2"
        >
          <Input
            id="foodPairings"
            name="foodPairings"
            defaultValue={product?.foodPairings ?? ""}
            placeholder="Grilled steak | Aged cheese"
          />
        </Field>
      </Section>

      <Section title="Grape varietals">
        <div className="sm:col-span-2">
          {reference.varietals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No varietals defined.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {reference.varietals.map((v) => (
                <label
                  key={v.id}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm has-checked:border-burgundy has-checked:bg-burgundy/5"
                >
                  <input
                    type="checkbox"
                    name="varietalIds"
                    value={v.id}
                    defaultChecked={selectedVarietals.has(v.id)}
                    className="size-4 accent-[var(--burgundy)]"
                  />
                  {v.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Pricing & inventory">
        <Field label="Price (USD)" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={dollars(product?.priceCents)}
          />
        </Field>
        <Field label="Cost (USD)" htmlFor="cost" hint="Optional — used for margin reporting.">
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            min={0}
            defaultValue={dollars(product?.costCents)}
          />
        </Field>
        <Field label="Stock quantity" htmlFor="stockQuantity">
          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min={0}
            defaultValue={product?.stockQuantity ?? 0}
          />
        </Field>
        <Field label="Low-stock threshold" htmlFor="lowStockThreshold">
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={product?.lowStockThreshold ?? 5}
          />
        </Field>
      </Section>

      <Section title="Media & visibility">
        <Field
          label="Primary image URL"
          htmlFor="imageUrl"
          hint="Leave blank on create to use the category artwork. (Uploads use the stubbed storage service.)"
          className="sm:col-span-2"
        >
          <Input id="imageUrl" name="imageUrl" defaultValue={primaryImage} placeholder="/wines/red.svg" />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={product?.status ?? "DRAFT"}>
            {PRODUCT_STATUS.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="size-4 accent-[var(--burgundy)]"
            />
            Featured on storefront
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="wineOfMonth"
              defaultChecked={product?.wineOfMonth ?? false}
              className="size-4 accent-[var(--burgundy)]"
            />
            Wine of the month
          </label>
        </div>
      </Section>

      <Section title="SEO">
        <Field label="Meta title" htmlFor="metaTitle">
          <Input id="metaTitle" name="metaTitle" defaultValue={product?.metaTitle ?? ""} />
        </Field>
        <Field label="Meta description" htmlFor="metaDescription">
          <Input
            id="metaDescription"
            name="metaDescription"
            defaultValue={product?.metaDescription ?? ""}
          />
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-2">
        <ButtonLink href="/admin/products" variant="outline">
          Cancel
        </ButtonLink>
        <SaveButton mode={mode} />
      </div>
    </form>
  );
}
