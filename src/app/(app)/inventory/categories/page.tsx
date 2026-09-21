import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoryManager } from "@/components/categories/category-manager";
import { listCategories } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/inventory" />} aria-label="Back to inventory">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize products with categories and subcategories.</p>
        </div>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}