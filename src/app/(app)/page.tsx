import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, PackageXIcon, TrendingUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, listMovements, listProducts } from "@/lib/db/repository";
import { formatMoney } from "@/lib/money";
import { formatActivityDate } from "@/lib/time";
import { MOVEMENT_TYPE_LABELS, signedQuantity } from "@/lib/movements";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const node = (
    <div className="h-full rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {node}
    </Link>
  ) : (
    node
  );
}

function AttentionItem({
  id,
  name,
  stock,
  status,
}: {
  id: number;
  name: string;
  stock: number;
  status: "LOW_STOCK" | "OUT_OF_STOCK";
}) {
  return (
    <li>
      <Link
        href={`/inventory/${id}`}
        className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/40"
      >
        <span className="truncate font-medium">{name}</span>
        <Badge
          variant="outline"
          className={
            status === "OUT_OF_STOCK" ? "shrink-0 text-muted-foreground" : "shrink-0 text-amber-600"
          }
        >
          {stock} left
        </Badge>
      </Link>
    </li>
  );
}

export default async function DashboardPage() {
  const [stats, lowStock, outOfStock, recent] = await Promise.all([
    getDashboardStats(),
    listProducts({ status: "LOW_STOCK" }),
    listProducts({ status: "OUT_OF_STOCK" }),
    listMovements({ limit: 8 }),
  ]);

  const attentionItems = [
    ...outOfStock.map((row): { id: number; name: string; stock: number; status: "OUT_OF_STOCK" } => ({
      id: row.product.id,
      name: row.product.name,
      stock: row.product.stockQuantity,
      status: "OUT_OF_STOCK",
    })),
    ...lowStock.map((row): { id: number; name: string; stock: number; status: "LOW_STOCK" } => ({
      id: row.product.id,
      name: row.product.name,
      stock: row.product.stockQuantity,
      status: "LOW_STOCK",
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">A quick look at how your shop is doing, right now.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/inventory" />}>
            Inventory
          </Button>
          <Button render={<Link href="/sell" />}>
            <TrendingUpIcon className="size-4" />
            Quick Sell
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Inventory</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Products" value={stats.totalProducts} href="/inventory" />
          <StatCard label="Total Stock" value={stats.totalStock} href="/inventory" />
          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            hint="At or below minimum level"
            href="/inventory?status=LOW_STOCK"
          />
          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            hint="Sellable, but empty"
            href="/inventory?status=OUT_OF_STOCK"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Today (Asia/Karachi)</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Sales" value={stats.salesToday} />
          <StatCard label="Items Sold" value={stats.itemsSoldToday} />
          <StatCard label="Revenue" value={formatMoney(stats.revenueTodayPaisa)} hint="Gross sales today" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Needs attention</CardTitle>
              <CardDescription>Out-of-stock and low-stock items, most urgent first.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/inventory" />}>
              View all
              <ArrowRightIcon className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {attentionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <AlertTriangleIcon className="size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">All clear</p>
                <p className="text-sm text-muted-foreground">No products are out of or low on stock.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {attentionItems.map((item) => (
                  <AttentionItem key={`${item.status}-${item.id}`} {...item} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Inventory value</CardTitle>
            <CardDescription>At purchase price across all active items.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{formatMoney(stats.inventoryValuePaisa)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Across {stats.totalProducts} products.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest stock movements across the shop.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/activity" />}>
            View all
            <ArrowRightIcon className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <PackageXIcon className="size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground">Add products or record sales to see it here.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map(({ movement, productName }) => (
                <li key={movement.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        movement.type === "SOLD"
                          ? "shrink-0 text-destructive"
                          : movement.type === "STOCK_ADDED"
                            ? "shrink-0 text-emerald-600"
                            : "shrink-0 text-muted-foreground"
                      }
                    >
                      {signedQuantity(movement.quantity)}
                    </Badge>
                    <span className="truncate font-medium">{productName}</span>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {MOVEMENT_TYPE_LABELS[movement.type]} · {formatActivityDate(movement.createdAt.getTime())}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}