import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductCard } from "@/components/site/product-card";
import { CatalogSort } from "@/components/site/catalog-sort";
import { getCategories, getProducts, type ProductSort } from "@/lib/queries";

export const metadata: Metadata = {
  title: "All Wines",
  description: "Browse our curated cellar by type, region and price.",
};

type SearchParams = Promise<{
  type?: string;
  country?: string;
  q?: string;
  sort?: string;
}>;

export default async function WinesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      type: params.type,
      country: params.country,
      q: params.q,
      sort: params.sort as ProductSort | undefined,
    }),
  ]);

  const activeType = params.type;

  // Build a chip href that preserves the search query but swaps the type.
  function typeHref(slug?: string) {
    const sp = new URLSearchParams();
    if (slug) sp.set("type", slug);
    if (params.country) sp.set("country", params.country);
    if (params.q) sp.set("q", params.q);
    if (params.sort) sp.set("sort", params.sort);
    const qs = sp.toString();
    return qs ? `/wines?${qs}` : "/wines";
  }

  const heading = params.country
    ? `Wines from ${params.country}`
    : params.q
      ? `Results for “${params.q}”`
      : activeType
        ? `${categories.find((c) => c.slug === activeType)?.name ?? "Wines"}`
        : "All Wines";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="border-b border-border pb-6">
        <p className="eyebrow mb-2">The cellar</p>
        <h1 className="font-heading text-4xl font-semibold">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "wine" : "wines"}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Type chips */}
        <nav className="flex flex-wrap gap-2">
          <TypeChip href={typeHref()} active={!activeType} label="All" />
          {categories.map((c) => (
            <TypeChip
              key={c.id}
              href={typeHref(c.slug)}
              active={activeType === c.slug}
              label={c.name}
            />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <form action="/wines" className="relative">
            {activeType && <input type="hidden" name="type" value={activeType} />}
            {params.country && (
              <input type="hidden" name="country" value={params.country} />
            )}
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              defaultValue={params.q}
              placeholder="Search wines…"
              className="h-9 w-44 pl-9 sm:w-56"
            />
          </form>
          <CatalogSort />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-heading text-xl">No wines match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing the search or browsing all wines.
          </p>
          <ButtonLink href="/wines" variant="outline" className="mt-5">
            Clear filters
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TypeChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-burgundy bg-burgundy text-primary-foreground"
          : "border-border bg-background hover:border-burgundy hover:text-burgundy",
      )}
    >
      {label}
    </Link>
  );
}
