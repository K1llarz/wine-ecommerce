import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard, Stars } from "@/components/site/product-card";
import { AddToCart } from "@/components/site/add-to-cart";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatPrice, parseFoodPairings, vintageLabel } from "@/lib/format";
import { siteConfig } from "@/lib/site";

type Params = Promise<{ slug: string }>;

function prettyLabel(value: string | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Wine not found" };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.tastingNotes ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const image = product.images[0];
  const soldOut = product.stockQuantity <= 0;
  const pairings = parseFoodPairings(product.foodPairings);

  const specs: { label: string; value: string | null }[] = [
    { label: "Vintage", value: vintageLabel(product.vintage) },
    { label: "ABV", value: product.alcohol ? `${product.alcohol}%` : null },
    { label: "Volume", value: `${product.volumeMl}ml` },
    { label: "Body", value: prettyLabel(product.body) },
    { label: "Sweetness", value: prettyLabel(product.sweetness) },
    { label: "Acidity", value: prettyLabel(product.acidity) },
    { label: "Appellation", value: product.appellation },
    { label: "Country", value: product.country },
  ];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: image ? [`${siteConfig.url}${image.url}`] : [],
    description: product.tastingNotes ?? undefined,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.producer ?? siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-burgundy">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/wines" className="hover:text-burgundy">Wines</Link></li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/wines?type=${product.category.slug}`}
              className="hover:text-burgundy"
            >
              {product.category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={image?.url ?? `/wines/${product.category.slug}.svg`}
            alt={image?.alt ?? product.name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <Badge variant="secondary">{product.category.name}</Badge>
          <h1 className="mt-3 font-heading text-4xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {[product.producer, product.region?.name, vintageLabel(product.vintage)]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {product.reviewCount > 0 && (
            <div className="mt-3">
              <Stars rating={product.avgRating} count={product.reviewCount} />
            </div>
          )}

          <p className="mt-5 font-heading text-3xl font-semibold">
            {formatPrice(product.priceCents)}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {soldOut
              ? "Currently out of stock"
              : product.stockQuantity <= product.lowStockThreshold
                ? `Only ${product.stockQuantity} left`
                : "In stock"}
          </p>

          <div className="mt-6">
            <AddToCart
              soldOut={soldOut}
              line={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                image: image?.url ?? `/wines/${product.category.slug}.svg`,
                maxQuantity: Math.max(1, product.stockQuantity),
              }}
            />
          </div>

          <Separator className="my-8" />

          {/* Specs */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {specs
              .filter((s) => s.value)
              .map((s) => (
                <div key={s.label}>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                    {s.label}
                  </dt>
                  <dd className="mt-0.5 font-medium">{s.value}</dd>
                </div>
              ))}
          </dl>

          {product.varietals.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Grape varietals
              </p>
              <p className="mt-1 font-medium">
                {product.varietals
                  .map(
                    (v) =>
                      v.varietal.name +
                      (v.percentage ? ` (${v.percentage}%)` : ""),
                  )
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tasting notes + pairings */}
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        {product.tastingNotes && (
          <div>
            <h2 className="font-heading text-2xl font-semibold">Tasting notes</h2>
            <p className="mt-3 leading-relaxed text-foreground/90">
              {product.tastingNotes}
            </p>
          </div>
        )}
        {pairings.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-semibold">Food pairings</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {pairings.map((p) => (
                <Badge key={p} variant="outline" className="text-sm">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-semibold">
          Reviews{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({product.reviewCount})
          </span>
        </h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            No reviews yet. Be the first to share your impression.
          </p>
        ) : (
          <ul className="mt-5 space-y-5">
            {product.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars rating={r.rating} />
                  <span className="text-sm text-muted-foreground">
                    {r.user.name ?? "Verified buyer"}
                  </span>
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                {r.body && (
                  <p className="mt-1 text-sm text-foreground/90">{r.body}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-semibold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
