import { getProductFormReferenceData } from "@/lib/admin-queries";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const reference = await getProductFormReferenceData();
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title="New product" description="Add a wine to the catalogue." />
      <ProductForm mode="create" reference={reference} />
    </div>
  );
}
