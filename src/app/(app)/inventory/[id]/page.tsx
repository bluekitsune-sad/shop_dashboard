import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { ProductActions } from "@/components/products/product-actions";
import { getProduct } from "@/lib/db/repository";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProduct(Number(id));
  return { title: row ? row.product.name : "Product" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProduct(Number(id));

  if (!row) {
    notFound();
  }

  const { product } = row;

  const details: { label: string; value: string }[] = [
    { label: "SKU", value: product.sku ?? "—" },
    { label: "Brand", value: product.brand ?? "—" },
    { label: "Purchase Price", value: formatMoney(product.purchasePrice) },
    { label: "Selling Price", value: formatMoney(product.sellingPrice) },
    { label: "Minimum Stock", value: String(product.minimumStock) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/inventory" />} aria-label="Back to inventory">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {row.categoryName ?? "Uncategorized"}
            {product.isArchived ? " · Archived" : ""}
          </p>
        </div>
        <ProductActions productId={product.id} initialArchived={product.isArchived} />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className="text-4xl font-bold tabular-nums">{product.stockQuantity}</p>
            </div>
            <StockStatusBadge stockQuantity={product.stockQuantity} minimumStock={product.minimumStock} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="font-medium">{d.value}</p>
              </div>
            ))}
          </div>
          {product.notes ? (
            <p className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{product.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="size-4 text-muted-foreground" />
            Stock Activity
          </CardTitle>
          <CardDescription>Add, sold, and adjusted movements for this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <p className="text-sm font-medium">No stock activity yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Stock changes will appear here automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
        <Badge variant="outline" className="shrink-0">
          Coming next
        </Badge>
        Add Stock, Sell, and Adjust actions will appear here.
      </div>
    </div>
  );
}