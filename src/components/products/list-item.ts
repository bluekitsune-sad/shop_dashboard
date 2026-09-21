export interface ProductListItem {
  id: number;
  name: string;
  brand: string | null;
  categoryText: string;
  sku: string | null;
  stockQuantity: number;
  minimumStock: number;
  sellingPrice: number;
}