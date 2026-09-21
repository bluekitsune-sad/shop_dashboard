import Link from "next/link";
import { ExternalLinkIcon, ShoppingCartIcon } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { formatMoney } from "@/lib/money";
import type { ProductListItem } from "@/components/products/list-item";

export function ProductTable({ products }: { products: ProductListItem[] }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-medium">{p.name}</div>
                {p.brand ? <div className="text-sm text-muted-foreground">{p.brand}</div> : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{p.categoryText}</TableCell>
              <TableCell className="text-right tabular-nums">{p.stockQuantity}</TableCell>
              <TableCell>
                <StockStatusBadge stockQuantity={p.stockQuantity} minimumStock={p.minimumStock} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(p.sellingPrice)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/sell?product=${p.id}`} />}
                    aria-label={`Sell ${p.name}`}
                  >
                    <ShoppingCartIcon className="size-4" />
                    Sell
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/inventory/${p.id}`} />}
                    aria-label={`View ${p.name}`}
                  >
                    <ExternalLinkIcon className="size-4" />
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}