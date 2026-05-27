import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAdminProduct, getProductFormReferenceData } from "@/lib/admin-queries";
import { deleteProductAction } from "@/app/actions/admin-products";
import { vintageLabel } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Edit · ${product.name}` : "Edit product" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, reference] = await Promise.all([
    getAdminProduct(id),
    getProductFormReferenceData(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title={`${product.name} ${vintageLabel(product.vintage)}`}
        description={`SKU ${product.sku}`}
        action={
          product.status === "ACTIVE" ? (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-burgundy hover:underline"
              target="_blank"
            >
              View on storefront
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null
        }
      />

      <ProductForm mode="edit" product={product} reference={reference} />

      <Card className="mt-8 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Deleting removes this product permanently. If it appears on past orders it will be
            archived instead.
          </p>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <Button type="submit" variant="destructive">
              Delete product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
