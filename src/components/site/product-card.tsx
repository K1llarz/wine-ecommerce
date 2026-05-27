import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, vintageLabel } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries";

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="flex items-center gap-1 text-gold" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="size-3.5"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
      {typeof count === "number" && count > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">({count})</span>
      )}
    </span>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const soldOut = product.stockQuantity <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        <Image
          src={image?.url ?? `/wines/${product.category.slug}.svg`}
          alt={image?.alt ?? product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur">
          {product.category.name}
        </Badge>
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1.5 text-center text-xs tracking-wide text-background uppercase">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {product.region?.name ?? product.country ?? "—"} · {vintageLabel(product.vintage)}
        </p>
        <h3 className="mt-1 font-heading text-lg leading-snug font-medium group-hover:text-burgundy">
          {product.name}
        </h3>
        {product.producer && (
          <p className="mt-0.5 text-sm text-muted-foreground">{product.producer}</p>
        )}
        <div className="mt-2">
          {product.reviewCount > 0 ? (
            <Stars rating={product.avgRating} count={product.reviewCount} />
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
        </div>
        <p className="mt-auto pt-3 font-heading text-xl font-semibold">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
