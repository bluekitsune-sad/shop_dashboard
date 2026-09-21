import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STOCK_STATUS_LABELS, getStockStatus } from "@/lib/stock";

export function StockStatusBadge({
  stockQuantity,
  minimumStock,
}: {
  stockQuantity: number;
  minimumStock: number;
}) {
  const status = getStockStatus(stockQuantity, minimumStock);

  return (
    <Badge
      className={cn(
        status === "IN_STOCK" && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300",
        status === "LOW_STOCK" && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-400/15 dark:text-amber-300",
        status === "OUT_OF_STOCK" && "bg-destructive/10 text-destructive hover:bg-destructive/15",
      )}
    >
      {STOCK_STATUS_LABELS[status]}
    </Badge>
  );
}