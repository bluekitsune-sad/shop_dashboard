"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, Loader2Icon, SearchIcon, ShoppingCartIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sellFormSchema, type SellFormOutput } from "@/lib/validation";
import { formatMoney, paisaFromRupees, rupeesFromPaisa } from "@/lib/money";
import { STOCK_STATUS_LABELS, getStockStatus } from "@/lib/stock";
import type { SellableProduct } from "@/lib/db/repository";
import { sellProductAction } from "@/app/(app)/sell/actions";

export function SellProduct({
  products,
  initialProductId,
}: {
  products: SellableProduct[];
  initialProductId?: number | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedId, setSelectedId] = useState<number | null>(
    initialProductId && products.some((p) => p.id === initialProductId) ? initialProductId : null,
  );
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState<string>(() => {
    const initial = initialProductId ? products.find((p) => p.id === initialProductId) : undefined;
    return initial ? String(rupeesFromPaisa(initial.sellingPrice)) : "";
  });
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const product = selectedId !== null ? products.find((p) => p.id === selectedId) ?? null : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q));
  }, [products, query]);

  function selectProduct(p: SellableProduct) {
    setSelectedId(p.id);
    setQuantity("1");
    setUnitPrice(String(rupeesFromPaisa(p.sellingPrice)));
    setQuantityError(null);
    setPriceError(null);
  }

  function openConfirm() {
    if (!product) return;
    setQuantityError(null);
    setPriceError(null);
    const parsed = sellFormSchema.safeParse({
      productId: String(product.id),
      quantity,
      unitPrice,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "quantity") setQuantityError(issue.message);
        if (issue.path[0] === "unitPrice") setPriceError(issue.message);
      }
      return;
    }
    if (parsed.data.quantity > currentStock) {
      setQuantityError(`Only ${currentStock} in stock.`);
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSale() {
    if (!product) return;
    startTransition(async () => {
      const result = await sellProductAction({
        productId: String(product.id),
        quantity,
        unitPrice,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setConfirmOpen(false);
      toast.success(`Sold ${quantity} × ${product.name}`);
      setQuantity("1");
      router.refresh();
    });
  }

  const parsedPreview = useMemo(() => {
    if (!product) return null;
    const result = sellFormSchema.safeParse({ productId: String(product.id), quantity, unitPrice });
    if (!result.success) return null;
    const data: SellFormOutput = result.data;
    const unitPricePaisa = paisaFromRupees(data.unitPrice);
    return {
      quantity: data.quantity,
      unitPricePaisa,
      totalPaisa: data.quantity * unitPricePaisa,
    };
  }, [product, quantity, unitPrice]);

  const currentStock = product?.stockQuantity ?? 0;
  const outOfStock = product !== null && currentStock <= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCartIcon className="size-4 text-muted-foreground" />
            Pick a product
          </CardTitle>
          <CardDescription>Search by name or brand, then select a product to sell.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-8"
              aria-label="Search products to sell"
            />
          </div>

          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.map((p) => {
              const itemStatus = getStockStatus(p.stockQuantity, 0);
              const isSelected = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectProduct(p)}
                    disabled={p.stockQuantity <= 0}
                    aria-pressed={isSelected}
                    className={
                      "flex w-full items-start justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 " +
                      (isSelected
                        ? "border-primary bg-primary/5 ring-3 ring-primary/20"
                        : "hover:bg-muted")
                    }
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-medium">
                        {p.name}
                        {isSelected ? <CheckIcon className="size-3.5 text-primary" /> : null}
                      </span>
                      <span className="block truncate text-muted-foreground">
                        {[p.categoryName, p.brand].filter(Boolean).join(" · ") || "\u00A0"}
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        itemStatus === "OUT_OF_STOCK"
                          ? "shrink-0 text-muted-foreground"
                          : itemStatus === "LOW_STOCK"
                            ? "shrink-0 text-amber-600"
                            : "shrink-0"
                      }
                    >
                      {STOCK_STATUS_LABELS[itemStatus]}: {p.stockQuantity}
                    </Badge>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                No products match &quot;{query}&quot;.
              </li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sale details</CardTitle>
          <CardDescription>
            {product
              ? outOfStock
                ? "This product is out of stock and cannot be sold."
                : `Selling ${product.name}.`
              : "Select a product to see the sale form."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!product ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              No product selected.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="font-medium">{product.name}</span>
                <span className="text-sm tabular-nums">
                  <span className="text-2xl font-semibold">{currentStock}</span> in stock
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sell-qty">Quantity</Label>
                  <Input
                    id="sell-qty"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    max={currentStock || 1}
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setQuantityError(null);
                    }}
                    aria-invalid={Boolean(quantityError)}
                  />
                  {quantityError ? <p className="text-sm font-medium text-destructive">{quantityError}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sell-price">Unit price (Rs)</Label>
                  <Input
                    id="sell-price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => {
                      setUnitPrice(e.target.value);
                      setPriceError(null);
                    }}
                    aria-invalid={Boolean(priceError)}
                  />
                  {priceError ? <p className="text-sm font-medium text-destructive">{priceError}</p> : null}
                </div>
              </div>

              <div className="space-y-1 rounded-lg border p-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {parsedPreview
                      ? `${parsedPreview.quantity} × ${formatMoney(parsedPreview.unitPricePaisa)}`
                      : "—"}{" "}
                    / unit
                  </span>
                  <span>Total</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm">New stock: {currentStock - (parsedPreview?.quantity ?? 0)}</span>
                  <span className="text-2xl font-semibold tabular-nums">
                    {parsedPreview ? formatMoney(parsedPreview.totalPaisa) : "—"}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                type="button"
                onClick={openConfirm}
                disabled={outOfStock || isPending}
              >
                <ShoppingCartIcon className="size-4" />
                Confirm Sale
              </Button>

              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm this sale?</DialogTitle>
                    <DialogDescription>
                      {parsedPreview
                        ? `Sell ${parsedPreview.quantity} × ${product.name} for ${formatMoney(
                            parsedPreview.totalPaisa,
                          )}. Stock changes ${currentStock} → ${currentStock - parsedPreview.quantity}.`
                        : "Review the sale details."}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
                      Cancel
                    </Button>
                    <Button onClick={confirmSale} disabled={isPending}>
                      {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
                      Confirm Sale
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}