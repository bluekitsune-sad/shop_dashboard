import { ShoppingCartIcon } from "lucide-react";

export default function SellPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sell</h1>
        <p className="text-sm text-muted-foreground">Record a sale quickly — stock adjusts automatically.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <ShoppingCartIcon className="mb-4 size-10 text-muted-foreground" />
        <p className="font-medium">Selling arrives in a later milestone</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Pick a product, enter the quantity, confirm, and the sale is recorded with stock updated safely.
        </p>
      </div>
    </div>
  );
}