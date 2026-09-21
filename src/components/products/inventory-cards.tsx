import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/components/stock-status-badge";
import type { ProductListItem } from "@/components/products/list-item";

export function ProductCards({ products }: { products: ProductListItem[] }) {
  return (
    <ul className="space-y-3 md:hidden">
      {products.map((p) => (
        <li key={p.id}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <Link href={`/inventory/${p.id}`} className="flex items-start justify-between gap-2">
                <span className="font-medium leading-snug">{p.name}</span>
                <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </Link>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {p.categoryText}
                {p.brand ? ` · ${p.brand}` : ""}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{p.stockQuantity}</span>
                  <span className="text-sm text-muted-foreground">in stock</span>
                </div>
                <StockStatusBadge stockQuantity={p.stockQuantity} minimumStock={p.minimumStock} />
              </div>

              <Button variant="outline" size="sm" render={<Link href={`/inventory/${p.id}`} />}>
                View
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}