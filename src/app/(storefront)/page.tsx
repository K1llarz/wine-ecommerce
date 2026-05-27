import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductCard, Stars } from "@/components/site/product-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import {
  getCategories,
  getCountryHighlights,
  getFeaturedProducts,
  getWineOfTheMonth,
} from "@/lib/queries";
import { formatPrice, parseFoodPairings, vintageLabel } from "@/lib/format";

export default async function HomePage() {
  const [featured, wineOfMonth, categories, countries] = await Promise.all([
    getFeaturedProducts(8),
    getWineOfTheMonth(),
    getCategories(),
    getCountryHighlights(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,oklch(0.22_0.04_25)_0%,oklch(0.16_0.02_40)_60%,oklch(0.13_0.01_50)_100%)] text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:py-36">
          <p className="eyebrow mb-5">Est. in the old world</p>
          <h1 className="max-w-3xl font-heading text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
            A cellar of rare and remarkable wine
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            Hand-selected bottles from the world&apos;s great estates — delivered
            to your door with the care of a private merchant.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink
              href="/wines"
              className="h-11 bg-gold px-7 text-base text-[oklch(0.2_0.02_40)] hover:bg-gold/90"
            >
              Shop all wines
            </ButtonLink>
            <ButtonLink
              href="#collections"
              variant="outline"
              className="h-11 border-primary-foreground/30 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Explore collections
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section
        id="collections"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
      >
        <SectionHeading eyebrow="By the glass or the case" title="Curated collections" />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/wines?type=${c.slug}`}
              className="group relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-lg border border-border bg-card p-4"
            >
              <Image
                src={c.imageUrl ?? `/wines/${c.slug}.svg`}
                alt={c.name}
                fill
                sizes="(min-width: 1024px) 16vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative">
                <h3 className="font-heading text-lg font-medium text-white">{c.name}</h3>
                <p className="text-xs text-white/70">{c._count.products} wines</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Cellar selections" title="Featured this season" />
            <ButtonLink href="/wines" variant="link" className="hidden sm:inline-flex">
              View all <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Wine of the Month */}
      {wineOfMonth && (
        <section
          id="wine-of-the-month"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Link
              href={`/products/${wineOfMonth.slug}`}
              className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={
                  wineOfMonth.images[0]?.url ?? `/wines/${wineOfMonth.category.slug}.svg`
                }
                alt={wineOfMonth.name}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </Link>
            <div>
              <p className="eyebrow mb-3">Wine of the month</p>
              <h2 className="font-heading text-4xl font-semibold">{wineOfMonth.name}</h2>
              <p className="mt-2 text-muted-foreground">
                {wineOfMonth.producer} · {wineOfMonth.region?.name} ·{" "}
                {vintageLabel(wineOfMonth.vintage)}
              </p>
              {wineOfMonth.reviewCount > 0 && (
                <div className="mt-3">
                  <Stars rating={wineOfMonth.avgRating} count={wineOfMonth.reviewCount} />
                </div>
              )}
              <p className="mt-5 leading-relaxed text-foreground/90">
                {wineOfMonth.tastingNotes}
              </p>
              {parseFoodPairings(wineOfMonth.foodPairings).length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Pairs with:</span>{" "}
                  {parseFoodPairings(wineOfMonth.foodPairings).join(", ")}
                </p>
              )}
              <div className="mt-7 flex items-center gap-5">
                <span className="font-heading text-3xl font-semibold">
                  {formatPrice(wineOfMonth.priceCents)}
                </span>
                <ButtonLink href={`/products/${wineOfMonth.slug}`} className="h-11 px-6">
                  View bottle
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regions */}
      <section id="regions" className="bg-card py-20">
        <div className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="A sense of place" title="Explore by origin" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => (
              <Link
                key={c.country}
                href={`/wines?country=${encodeURIComponent(c.country)}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-background p-5 transition-colors hover:border-gold"
              >
                <div>
                  <h3 className="font-heading text-xl font-medium group-hover:text-burgundy">
                    {c.country}
                  </h3>
                  <p className="text-sm text-muted-foreground">{c.count} wines</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[linear-gradient(135deg,oklch(0.22_0.04_25)_0%,oklch(0.15_0.02_45)_100%)] text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="eyebrow mb-3">Stay in the know</p>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            New arrivals, allocations &amp; tasting notes
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Join the cellar list for first access to rare bottles and
            members-only releases.
          </p>
          <div className="mx-auto mt-7 flex max-w-md justify-center">
            <NewsletterForm idPrefix="home-newsletter" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-semibold sm:text-4xl">{title}</h2>
    </div>
  );
}
