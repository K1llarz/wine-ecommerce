import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Wine,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import {
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
} from "@/lib/admin-queries";
import { formatPrice } from "@/lib/format";
import { vintageLabel } from "@/lib/format";
import { AdminPageHeader, StatCard, StatusBadge, EmptyState } from "@/components/admin/admin-ui";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [stats, lowStock, recentOrders] = await Promise.all([
    getDashboardStats(),
    getLowStockProducts(6),
    getRecentOrders(6),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Sales, inventory and catalogue at a glance."
        action={<ButtonLink href="/admin/products/new">Add product</ButtonLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatPrice(stats.revenue30dCents)}
          hint={`${stats.orders30d} order${stats.orders30d === 1 ? "" : "s"} in last 30 days`}
          icon={<DollarSign className="size-4" />}
        />
        <StatCard
          label="Open orders"
          value={String(stats.pendingOrders)}
          hint={`${stats.totalOrders} total all-time`}
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          label="Customers"
          value={String(stats.customers)}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Active products"
          value={String(stats.activeProducts)}
          hint={`${formatPrice(stats.inventoryValueCents)} stock value`}
          icon={<Wine className="size-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardAction>
              <Link href="/admin/orders" className="text-sm text-burgundy hover:underline">
                View all
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Orders placed in the storefront will appear here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">#{order.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-medium">
                        {formatPrice(order.totalCents)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.lowStock > 0 ? (
                <AlertTriangle className="size-4 text-amber-500" />
              ) : (
                <Boxes className="size-4 text-muted-foreground" />
              )}
              Low stock
            </CardTitle>
            <CardAction>
              <Link href="/admin/inventory" className="text-sm text-burgundy hover:underline">
                Manage
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <EmptyState
                title="Everything well stocked"
                description="No products are at or below their low-stock threshold."
              />
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="truncate text-sm font-medium hover:text-burgundy"
                      >
                        {p.name}{" "}
                        <span className="text-muted-foreground">{vintageLabel(p.vintage)}</span>
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {p.stockQuantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
