import Link from "next/link";
import Image from "next/image";
import { Pencil, Search } from "lucide-react";
import { listAdminProducts } from "@/lib/admin-queries";
import { formatPrice, vintageLabel } from "@/lib/format";
import { PRODUCT_STATUS } from "@/lib/constants";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/admin-ui";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Products" };

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "ALL";
  const products = await listAdminProducts({ q, status });

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}`}
        action={<ButtonLink href="/admin/products/new">Add product</ButtonLink>}
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
        <div className="relative grow sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search name, SKU or producer…"
            className="pl-8"
            aria-label="Search products"
          />
        </div>
        <Select name="status" defaultValue={status} className="sm:w-40" aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {PRODUCT_STATUS.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
        {q || status !== "ALL" ? (
          <ButtonLink href="/admin/products" variant="ghost">
            Reset
          </ButtonLink>
        ) : null}
      </form>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            q || status !== "ALL"
              ? "Try adjusting your search or filters."
              : "Create your first product to get started."
          }
          action={<ButtonLink href="/admin/products/new">Add product</ButtonLink>}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const low = p.stockQuantity <= p.lowStockThreshold;
                const image = p.images[0];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3 font-medium hover:text-burgundy"
                      >
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={image?.url ?? "/wines/red.svg"}
                            alt={image?.alt ?? p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{p.name}</span>
                          <span className="block text-xs font-normal text-muted-foreground">
                            {vintageLabel(p.vintage)}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.sku}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.category.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(p.priceCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          low
                            ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                            : ""
                        }
                      >
                        {p.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <ButtonLink
                        href={`/admin/products/${p.id}`}
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="size-4" />
                      </ButtonLink>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
