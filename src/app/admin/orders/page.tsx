import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { ORDER_STATUS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { AdminPageHeader, StatusBadge, EmptyState } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Orders" };

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "ALL";
  const where: Prisma.OrderWhereInput = status !== "ALL" ? { status } : {};

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title="Orders" description="Track and fulfil customer orders." />

      <form method="get" className="mb-4 flex items-end gap-2">
        <Select name="status" defaultValue={status} className="w-44" aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {ORDER_STATUS.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When customers complete checkout, their orders will show up here for fulfilment."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">#{o.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{o.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {o._count.items}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(o.totalCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
