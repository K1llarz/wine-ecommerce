import { listInventory } from "@/lib/admin-queries";
import { vintageLabel } from "@/lib/format";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-ui";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const products = await listInventory();
  const lowCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description={
          lowCount > 0
            ? `${lowCount} product${lowCount === 1 ? "" : "s"} at or below threshold`
            : "All products above their low-stock threshold."
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">In stock</TableHead>
              <TableHead className="text-right">Threshold</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const low = p.stockQuantity <= p.lowStockThreshold;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {vintageLabel(p.vintage)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.sku}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        low
                          ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                          : "font-medium"
                      }
                    >
                      {p.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.lowStockThreshold}
                  </TableCell>
                  <TableCell className="min-w-[18rem]">
                    <StockAdjuster productId={p.id} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
