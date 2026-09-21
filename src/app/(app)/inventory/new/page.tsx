import { ProductForm } from "@/components/products/product-form";
import { listCategories } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/inventory" />} aria-label="Back to inventory">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Add Product</h1>
          <p className="text-sm text-muted-foreground">Add a phone, accessory, or perfume to your inventory.</p>
        </div>
      </div>

      <div className="rounded-xl border p-4 sm:p-6">
        <ProductForm categories={categories} mode="create" />
      </div>
    </div>
  );
}