import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";

import { paisaFromRupees } from "@/lib/money";
import type { ProductFormOutput } from "@/lib/validation";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import type { StockStatus } from "@/lib/stock";

export type StatusFilter = StockStatus | "all";

export interface ProductFilters {
  search?: string;
  categoryId?: number | null;
  status?: StatusFilter;
  includeArchived?: boolean;
}

export interface ProductWithCategory {
  product: typeof products.$inferSelect;
  categoryName: string | null;
  categoryParentId: number | null;
}

export type CategoryNode = typeof categories.$inferSelect;

export async function listCategories(): Promise<CategoryNode[]> {
  return db.select().from(categories).orderBy(desc(categories.parentId), categories.name);
}

/** IDs of a category plus (when it is a parent) all of its children. */
export async function getCategorySubtreeIds(categoryId: number): Promise<number[]> {
  const rows = await db
    .select({ id: categories.id, parentId: categories.parentId })
    .from(categories);
  const ids = new Set(rows.filter((r) => r.id === categoryId).map((r) => r.id));
  rows.filter((r) => r.parentId === categoryId).forEach((r) => ids.add(r.id));
  return [...ids];
}

export async function listProducts(filters: ProductFilters = {}): Promise<ProductWithCategory[]> {
  const conditions: ReturnType<typeof eq>[] = [];

  if (!filters.includeArchived) {
    conditions.push(eq(products.isArchived, false));
  }

  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, q),
        like(products.brand, q),
        like(products.sku, q),
      )!,
    );
  }

  if (filters.categoryId) {
    const subtreeIds = await getCategorySubtreeIds(filters.categoryId);
    conditions.push(sql`${products.categoryId} in (${subtreeIds.join(", ")})`);
  }

  if (filters.status && filters.status !== "all") {
    if (filters.status === "OUT_OF_STOCK") {
      conditions.push(eq(products.stockQuantity, 0));
    } else if (filters.status === "LOW_STOCK") {
      conditions.push(
        and(gte(products.stockQuantity, 1), sql`${products.stockQuantity} <= ${products.minimumStock}`)!,
      );
    } else {
      conditions.push(sql`${products.stockQuantity} > ${products.minimumStock}`);
    }
  }

  const rows = await db
    .select({
      product: products,
      categoryName: categories.name,
      categoryParentId: categories.parentId,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(sql`${products.stockQuantity} = 0`), products.name);

  return rows;
}

export async function getProduct(id: number): Promise<ProductWithCategory | undefined> {
  const rows = await db
    .select({
      product: products,
      categoryName: categories.name,
      categoryParentId: categories.parentId,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);
  return rows[0];
}

export async function createProduct(input: ProductFormOutput): Promise<typeof products.$inferSelect> {
  const categoryExists = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, input.categoryId))
    .limit(1);
  if (categoryExists.length === 0) {
    throw new Error("Selected category does not exist");
  }

  const [row] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      name: input.name,
      brand: input.brand ?? null,
      sku: input.sku ?? null,
      purchasePrice: paisaFromRupees(input.purchasePrice),
      sellingPrice: paisaFromRupees(input.sellingPrice),
      stockQuantity: input.stockQuantity,
      minimumStock: input.minimumStock,
      imageUrl: input.imageUrl ?? null,
      notes: input.notes ?? null,
    })
    .returning();
  return row;
}

export async function updateProduct(id: number, input: ProductFormOutput): Promise<void> {
  if (input.categoryId !== undefined) {
    const categoryExists = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1);
    if (categoryExists.length === 0) {
      throw new Error("Selected category does not exist");
    }
  }

  await db
    .update(products)
    .set({
      categoryId: input.categoryId,
      name: input.name,
      brand: input.brand ?? null,
      sku: input.sku ?? null,
      purchasePrice: paisaFromRupees(input.purchasePrice),
      sellingPrice: paisaFromRupees(input.sellingPrice),
      stockQuantity: input.stockQuantity,
      minimumStock: input.minimumStock,
      imageUrl: input.imageUrl ?? null,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
}

export async function setProductArchived(id: number, archived: boolean): Promise<void> {
  await db
    .update(products)
    .set({ isArchived: archived, updatedAt: new Date() })
    .where(eq(products.id, id));
}