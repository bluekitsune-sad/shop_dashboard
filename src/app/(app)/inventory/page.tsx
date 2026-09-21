import Link from "next/link";
import { PlusIcon, PackageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InventoryFilters } from "@/components/products/inventory-filters";
import { ProductCards } from "@/components/products/inventory-cards";
import { ProductTable } from "@/components/products/inventory-table";
import type { ProductListItem } from "@/components/products/list-item";
import { listCategories, listProducts } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const categoryId = params.category ? Number(params.category) || undefined : undefined;
  const status = params.status;

  const [categories, rows] = await Promise.all([
    listCategories(),
    listProducts({
      search: q,
      categoryId,
      status: status === "IN_STOCK" || status === "LOW_STOCK" || status === "OUT_OF_STOCK" ? status : "all",
    }),
  ]);

  const categoryPathById = new Map<number, string>();
  for (const c of categories) {
    categoryPathById.set(c.id, c.name);
  }
  for (const c of categories) {
    if (c.parentId !== null) {
      const parentName = categoryPathById.get(c.parentId);
      if (parentName) {
        categoryPathById.set(c.id, `${parentName} → ${c.name}`);
      }
    }
  }

  const products: ProductListItem[] = rows.map(({ product, categoryName }) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    categoryText: categoryName ? (categoryPathById.get(product.categoryId) ?? categoryName) : "—",
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    minimumStock: product.minimumStock,
    sellingPrice: product.sellingPrice,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Your products and current stock at a glance.
          </p>
        </div>
        <Button size="lg" render={<Link href="/inventory/new" />} data-testid="add-product">
          <PlusIcon className="size-4" />
          Add Product
        </Button>
      </div>

      <InventoryFilters
        key={`${q ?? ""}|${params.category ?? ""}|${status ?? ""}`}
        search={q ?? ""}
        categoryId={params.category ?? ""}
        status={status ?? "all"}
        categories={categories}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <PackageIcon className="mb-4 size-10 text-muted-foreground" />
          <p className="font-medium">
            {q || categoryId || (status && status !== "all") ? "No products match your filters" : "No products yet"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {q || categoryId || (status && status !== "all")
              ? "Try clearing the search or filters."
              : "Add your first product to start tracking inventory."}
          </p>
          {!(q || categoryId || (status && status !== "all")) ? (
            <Button className="mt-4" size="lg" render={<Link href="/inventory/new" />}>
              <PlusIcon className="size-4" />
              Add Product
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <ProductCards products={products} />
          <ProductTable products={products} />
        </>
      )}
    </div>
  );
}