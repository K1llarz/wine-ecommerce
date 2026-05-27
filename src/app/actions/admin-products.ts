"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/format";
import {
  PRODUCT_STATUS,
  WINE_BODY,
  WINE_SWEETNESS,
  WINE_ACIDITY,
  INVENTORY_REASONS,
} from "@/lib/constants";

export type ProductFormState = { ok: false; message: string } | null;
export type StockAdjustState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | null;

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalString = (max: number) =>
  z.preprocess(emptyToUndef, z.string().trim().max(max).optional());

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(160),
  sku: z.string().trim().min(1, "SKU is required.").max(60),
  slug: optionalString(200),
  description: optionalString(5000),
  categoryId: z.string().min(1, "Please choose a category."),
  regionId: z.preprocess(emptyToUndef, z.string().optional()),
  producer: optionalString(160),
  appellation: optionalString(160),
  country: optionalString(80),
  vintage: z.preprocess(emptyToUndef, z.coerce.number().int().min(1900).max(2100).optional()),
  alcohol: z.preprocess(emptyToUndef, z.coerce.number().min(0).max(70).optional()),
  volumeMl: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).max(20000).optional()),
  body: z.preprocess(emptyToUndef, z.enum(WINE_BODY).optional()),
  sweetness: z.preprocess(emptyToUndef, z.enum(WINE_SWEETNESS).optional()),
  acidity: z.preprocess(emptyToUndef, z.enum(WINE_ACIDITY).optional()),
  tastingNotes: optionalString(5000),
  foodPairings: optionalString(2000),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  cost: z.preprocess(emptyToUndef, z.coerce.number().min(0).optional()),
  stockQuantity: z.preprocess(
    (v) => (v === "" || v == null ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  lowStockThreshold: z.preprocess(
    (v) => (v === "" || v == null ? 5 : v),
    z.coerce.number().int().min(0),
  ),
  status: z.enum(PRODUCT_STATUS),
  metaTitle: optionalString(200),
  metaDescription: optionalString(400),
  imageUrl: optionalString(500),
});

export async function saveProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();

  const id = formData.get("id");
  const productId = typeof id === "string" && id ? id : null;
  const featured = formData.get("featured") === "on";
  const wineOfMonth = formData.get("wineOfMonth") === "on";
  const varietalIds = formData
    .getAll("varietalIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  const slug = (d.slug ? slugify(d.slug) : "") || slugify(`${d.name}-${d.vintage ?? "nv"}`);
  const priceCents = Math.round(d.price * 100);
  const costCents = d.cost != null ? Math.round(d.cost * 100) : null;

  const data = {
    name: d.name,
    sku: d.sku,
    slug,
    description: d.description ?? null,
    categoryId: d.categoryId,
    regionId: d.regionId || null,
    producer: d.producer ?? null,
    appellation: d.appellation ?? null,
    country: d.country ?? null,
    vintage: d.vintage ?? null,
    alcohol: d.alcohol ?? null,
    volumeMl: d.volumeMl ?? 750,
    body: d.body ?? null,
    sweetness: d.sweetness ?? null,
    acidity: d.acidity ?? null,
    tastingNotes: d.tastingNotes ?? null,
    foodPairings: d.foodPairings ?? null,
    priceCents,
    costCents,
    stockQuantity: d.stockQuantity,
    lowStockThreshold: d.lowStockThreshold,
    status: d.status,
    featured,
    wineOfMonth,
    metaTitle: d.metaTitle ?? null,
    metaDescription: d.metaDescription ?? null,
  };

  try {
    if (productId) {
      const existing = await db.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true },
      });
      if (!existing) return { ok: false, message: "Product not found." };

      await db.$transaction(async (tx) => {
        await tx.product.update({ where: { id: productId }, data });
        await tx.productVarietal.deleteMany({ where: { productId } });
        if (varietalIds.length) {
          await tx.productVarietal.createMany({
            data: varietalIds.map((varietalId) => ({ productId, varietalId })),
          });
        }
        if (d.imageUrl) {
          const primary = await tx.productImage.findFirst({
            where: { productId, isPrimary: true },
          });
          if (primary) {
            await tx.productImage.update({
              where: { id: primary.id },
              data: { url: d.imageUrl, alt: `${d.name} bottle` },
            });
          } else {
            await tx.productImage.create({
              data: { productId, url: d.imageUrl, alt: `${d.name} bottle`, isPrimary: true },
            });
          }
        }
        const delta = d.stockQuantity - existing.stockQuantity;
        if (delta !== 0) {
          await tx.inventoryLog.create({
            data: {
              productId,
              change: delta,
              reason: "ADJUSTMENT",
              note: "Stock edited via product form",
              adminUserId: admin.id,
            },
          });
        }
      });
    } else {
      let imageUrl = d.imageUrl;
      if (!imageUrl) {
        const category = await db.category.findUnique({
          where: { id: d.categoryId },
          select: { name: true },
        });
        imageUrl = category ? `/wines/${slugify(category.name)}.svg` : "/wines/red.svg";
      }
      await db.product.create({
        data: {
          ...data,
          images: {
            create: [{ url: imageUrl, alt: `${d.name} bottle`, isPrimary: true, sortOrder: 0 }],
          },
          varietals: varietalIds.length
            ? { create: varietalIds.map((varietalId) => ({ varietalId })) }
            : undefined,
          inventoryLogs:
            d.stockQuantity > 0
              ? {
                  create: [
                    {
                      change: d.stockQuantity,
                      reason: "RESTOCK",
                      note: "Initial stock (admin create)",
                      adminUserId: admin.id,
                    },
                  ],
                }
              : undefined,
        },
      });
    }
  } catch {
    return {
      ok: false,
      message: "Could not save the product — the SKU or slug may already be in use.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/wines");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/admin/products");

  try {
    await db.product.delete({ where: { id } });
  } catch {
    // Likely referenced by existing orders — archive instead of hard delete.
    await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/wines");
  redirect("/admin/products");
}

const adjustSchema = z.object({
  productId: z.string().min(1),
  change: z.coerce.number().int().refine((n) => n !== 0, "Enter a non-zero amount."),
  reason: z.enum(INVENTORY_REASONS),
  note: optionalString(300),
});

export async function adjustStockAction(
  _prev: StockAdjustState,
  formData: FormData,
): Promise<StockAdjustState> {
  const admin = await requireAdmin();
  const parsed = adjustSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid adjustment." };
  }
  const { productId, change, reason, note } = parsed.data;

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { stockQuantity: true },
  });
  if (!product) return { ok: false, message: "Product not found." };

  const nextStock = product.stockQuantity + change;
  if (nextStock < 0) {
    return { ok: false, message: "Adjustment would drop stock below zero." };
  }

  await db.$transaction([
    db.product.update({ where: { id: productId }, data: { stockQuantity: nextStock } }),
    db.inventoryLog.create({
      data: { productId, change, reason, note: note ?? null, adminUserId: admin.id },
    }),
  ]);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true, message: `Stock updated to ${nextStock}.` };
}
