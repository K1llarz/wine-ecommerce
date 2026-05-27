import { listCustomers } from "@/lib/admin-queries";
import { AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Customers" };

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} registered ${customers.length === 1 ? "account" : "accounts"}`}
      />

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>
                    <Badge variant={c.role === "CUSTOMER" ? "secondary" : "default"}>
                      {roleLabel(c.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{c._count.orders}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c._count.reviews}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
