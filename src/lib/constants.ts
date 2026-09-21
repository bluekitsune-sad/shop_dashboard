export const MOVEMENT_TYPES = ["STOCK_ADDED", "SOLD", "ADJUSTMENT"] as const;

export const ADJUSTMENT_REASONS = ["Damaged", "Lost", "Found", "Counting correction", "Other"] as const;

export const INITIAL_CATEGORIES: readonly { name: string; children?: readonly string[] }[] = [
  { name: "Phones", children: ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Other"] },
  {
    name: "Accessories",
    children: ["Charger", "Cable", "Case", "Screen Protector", "Earbuds", "Headphones", "Power Bank", "Other"],
  },
  { name: "Perfumes", children: ["Men's", "Women's", "Unisex", "Other"] },
];