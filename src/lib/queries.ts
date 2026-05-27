import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

// Shared shape for product cards/grids: product + category, region and the
// primary image.
const productCardInclude = {
  category: true,
  region: true,
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    take: 1,
  },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{
  include: typeof productCardInclude;
}>;

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  return db.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getWineOfTheMonth(): Promise<ProductCardData | null> {
  return db.product.findFirst({
    where: { status: "ACTIVE", wineOfMonth: true },
    include: productCardInclude,
  });
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

/** Aggregate active products by country for the homepage region highlights. */
export async function getCountryHighlights(): Promise<
  { country: string; count: number }[]
> {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", country: { not: null } },
    select: { country: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.country) continue;
    counts.set(r.country, (counts.get(r.country) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

const productDetailInclude = {
  category: true,
  region: true,
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  varietals: { include: { varietal: true } },
  reviews: {
    where: { status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ProductInclude;

export type ProductDetailData = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailData | null> {
  return db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productDetailInclude,
  });
}

export async function getRelatedProducts(
  product: { id: string; categoryId: string },
  limit = 4,
): Promise<ProductCardData[]> {
  return db.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: productCardInclude,
    take: limit,
    orderBy: { avgRating: "desc" },
  });
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export type ProductFilters = {
  type?: string; // category slug
  country?: string;
  q?: string;
  sort?: ProductSort;
};

function sortToOrderBy(
  sort: ProductSort | undefined,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "newest":
      return { createdAt: "desc" };
    case "rating":
      return { avgRating: "desc" };
    default:
      return { featured: "desc" };
  }
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductCardData[]> {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (filters.type) where.category = { slug: filters.type };
  if (filters.country) where.country = filters.country;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { producer: { contains: filters.q, mode: "insensitive" } },
      { tastingNotes: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return db.product.findMany({
    where,
    include: productCardInclude,
    orderBy: [sortToOrderBy(filters.sort), { name: "asc" }],
    take: 60,
  });
}
