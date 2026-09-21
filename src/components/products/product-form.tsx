"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SaveIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelect } from "@/components/products/category-select";
import { createProductAction, updateProductAction } from "@/app/(app)/inventory/actions";
import { productFormSchema, type ProductFormValues } from "@/lib/validation";
import { rupeesFromPaisa } from "@/lib/money";
import type { CategoryNode } from "@/lib/db/repository";

export interface ProductFormInitial {
  name: string;
  categoryId: number;
  brand: string | null;
  sku: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minimumStock: number;
  imageUrl: string | null;
  notes: string | null;
}

export function ProductForm({
  categories,
  mode,
  productId,
  initial,
}: {
  categories: CategoryNode[];
  mode: "create" | "edit";
  productId?: number;
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema, undefined, { raw: true }),
    defaultValues: {
      name: initial?.name ?? "",
      categoryId: initial ? String(initial.categoryId) : "",
      brand: initial?.brand ?? "",
      sku: initial?.sku ?? "",
      purchasePrice: initial ? String(rupeesFromPaisa(initial.purchasePrice)) : "",
      sellingPrice: initial ? String(rupeesFromPaisa(initial.sellingPrice)) : "",
      stockQuantity: initial ? String(initial.stockQuantity) : "0",
      minimumStock: initial ? String(initial.minimumStock) : "0",
      imageUrl: initial?.imageUrl ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const busy = isSubmitting || isPending;

  async function onSubmit(values: ProductFormValues) {
    const result =
      mode === "edit" && productId !== undefined
        ? await updateProductAction(productId, values)
        : await createProductAction(values);

    if (result.ok) {
      toast.success(mode === "edit" ? "Product updated." : "Product created.");
      startTransition(() => {
        router.push(mode === "edit" && productId !== undefined ? `/inventory/${productId}` : "/inventory");
      });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">
          Product name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. USB-C Fast Charger"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? <p className="text-sm font-medium text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              categories={categories}
              value={field.value || null}
              onChange={(v) => field.onChange(v ?? "")}
              invalid={Boolean(errors.categoryId)}
            />
          )}
        />
        {errors.categoryId ? <p className="text-sm font-medium text-destructive">{errors.categoryId.message}</p> : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" placeholder="e.g. Apple" {...register("brand")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Product Code</Label>
          <Input id="sku" placeholder="Optional" {...register("sku")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" type="url" inputMode="url" placeholder="Optional" {...register("imageUrl")} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price (Rs)</Label>
          <Input
            id="purchasePrice"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            aria-invalid={Boolean(errors.purchasePrice)}
            {...register("purchasePrice")}
          />
          {errors.purchasePrice ? (
            <p className="text-sm font-medium text-destructive">{errors.purchasePrice.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">
            Selling Price (Rs) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sellingPrice"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            aria-invalid={Boolean(errors.sellingPrice)}
            {...register("sellingPrice")}
          />
          {errors.sellingPrice ? (
            <p className="text-sm font-medium text-destructive">{errors.sellingPrice.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Current Stock</Label>
          <Input
            id="stockQuantity"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            aria-invalid={Boolean(errors.stockQuantity)}
            {...register("stockQuantity")}
          />
          {errors.stockQuantity ? (
            <p className="text-sm font-medium text-destructive">{errors.stockQuantity.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimumStock">Minimum Stock</Label>
          <Input
            id="minimumStock"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            aria-invalid={Boolean(errors.minimumStock)}
            {...register("minimumStock")}
          />
          {errors.minimumStock ? (
            <p className="text-sm font-medium text-destructive">{errors.minimumStock.message}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Products at or below this level are flagged as low stock.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} placeholder="Optional" {...register("notes")} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <Loader2Icon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
          {mode === "edit" ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}