export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

/**
 * Stock status is always derived from current stock — never stored.
 *   In Stock:    stock_quantity > minimum_stock
 *   Low Stock:   stock_quantity > 0 AND stock_quantity <= minimum_stock
 *   Out of Stock: stock_quantity = 0
 */
export function getStockStatus(stockQuantity: number, minimumStock: number): StockStatus {
  if (stockQuantity <= 0) return "OUT_OF_STOCK";
  if (stockQuantity <= minimumStock) return "LOW_STOCK";
  return "IN_STOCK";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};