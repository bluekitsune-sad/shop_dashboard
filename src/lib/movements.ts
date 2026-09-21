import type { MovementType } from "@/lib/db/schema";

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  SOLD: "Sold",
  STOCK_ADDED: "Stock added",
  ADJUSTMENT: "Adjusted",
};

export function signedQuantity(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : String(quantity);
}