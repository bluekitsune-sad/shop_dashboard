import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/product-form";
import { listCategories, getProduct } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProduct(Number(id));

  if (!row) {
    notFound();
  }

  const categories = await listCategories();
  const { product } = row;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/inventory/${id}`} />} aria-label="Back to product">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <PencilIcon className="size-5 text-muted-foreground" />
            Edit Product
          </h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <div className="rounded-xl border p-4 sm:p-6">
        <ProductForm
          categories={categories}
          mode="edit"
          productId={product.id}
          initial={{
            name: product.name,
            categoryId: product.categoryId,
            brand: product.brand,
            sku: product.sku,
            purchasePrice: product.purchasePrice,
            sellingPrice: product.sellingPrice,
            stockQuantity: product.stockQuantity,
            minimumStock: product.minimumStock,
            imageUrl: product.imageUrl,
            notes: product.notes,
          }}
        />
      </div>
    </div>
  );
}