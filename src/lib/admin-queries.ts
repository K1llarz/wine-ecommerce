import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type DashboardStats = {
  revenue30dCents: number;
  orders30d: number;
  totalOrders: number;
  pendingOrders: number;
  customers: number;
  activeProducts: number;
  lowStock: number;
  inventoryValueCents: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);

  const [
    revenueAgg,
    orders30d,
    totalOrders,
    pendingOrders,
    customers,
    activeProducts,
    products,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: "PAID", createdAt: { gte: since } },
    }),
    db.order.count({ where: { createdAt: { gte: since } } }),
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.findMany({ select: { stockQuantity: true, priceCents: true, lowStockThreshold: true } }),
  ]);

  const inventoryValueCents = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.priceCents,
    0,
  );
  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

  return {
    revenue30dCents: revenueAgg._sum.totalCents ?? 0,
    orders30d,
    totalOrders,
    pendingOrders,
    customers,
    activeProducts,
    lowStock,
    inventoryValueCents,
  };
}

const adminProductSelect = {
  id: true,
  name: true,
  sku: true,
  status: true,
  priceCents: true,
  stockQuantity: true,
  lowStockThreshold: true,
  vintage: true,
  updatedAt: true,
  category: { select: { name: true } },
  images: {
    where: { isPrimary: true },
    select: { url: true, alt: true },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type AdminProductRow = Prisma.ProductGetPayload<{ select: typeof adminProductSelect }>;

export async function listAdminProducts(filters: {
  q?: string;
  status?: string;
}): Promise<AdminProductRow[]> {
  const where: Prisma.ProductWhereInput = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
      { producer: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  return db.product.findMany({
    where,
    select: adminProductSelect,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

export async function getLowStockProducts(limit = 6) {
  const rows = await db.product.findMany({
    select: adminProductSelect,
    orderBy: { stockQuantity: "asc" },
    take: 50,
  });
  return rows.filter((p) => p.stockQuantity <= p.lowStockThreshold).slice(0, limit);
}

export async function getRecentOrders(limit = 6) {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      createdAt: true,
    },
  });
}

const editProductInclude = {
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  varietals: { select: { varietalId: true, percentage: true } },
} satisfies Prisma.ProductInclude;

export type EditProduct = Prisma.ProductGetPayload<{ include: typeof editProductInclude }>;

export async function getAdminProduct(id: string): Promise<EditProduct | null> {
  return db.product.findUnique({ where: { id }, include: editProductInclude });
}

export async function getProductFormReferenceData() {
  const [categories, regions, varietals] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, country: true } }),
    db.grapeVarietal.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { categories, regions, varietals };
}

export async function listCustomers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true } },
    },
    take: 200,
  });
}

export async function listInventory() {
  return db.product.findMany({
    orderBy: [{ status: "asc" }, { stockQuantity: "asc" }],
    select: {
      id: true,
      name: true,
      sku: true,
      status: true,
      stockQuantity: true,
      lowStockThreshold: true,
      vintage: true,
    },
    take: 300,
  });
}
