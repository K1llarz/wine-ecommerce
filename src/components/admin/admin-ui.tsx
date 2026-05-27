import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-burgundy">
            {icon}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

const STATUS_STYLES: Record<string, string> = {
  // product
  ACTIVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  DRAFT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ARCHIVED: "bg-muted text-muted-foreground",
  // order
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PROCESSING: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  SHIPPED: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/15 text-destructive",
  // payment
  PAID: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UNPAID: "bg-muted text-muted-foreground",
  REFUNDED: "bg-destructive/15 text-destructive",
  PARTIALLY_REFUNDED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <p className="font-heading text-lg font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
