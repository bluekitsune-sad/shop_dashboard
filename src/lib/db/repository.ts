import { and, count, desc, eq, gte, like, lt, or, sql } from "drizzle-orm";

import { paisaFromRupees } from "@/lib/money";
import type { ProductFormOutput } from "@/lib/validation";
import { db } from "@/lib/db";
import { categories, inventoryMovements, products, sales } from "@/lib/db/schema";
import type { StockStatus } from "@/lib/stock";
import { endOfToday, startOfToday } from "@/lib/time";

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

  return db.transaction(async (tx) => {
    const [row] = await tx
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

    await tx.insert(inventoryMovements).values({
      productId: row.id,
      type: "STOCK_ADDED",
      quantity: row.stockQuantity,
      reason: "Initial stock",
    });

    return row;
  });
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

export interface SellableProduct {
  id: number;
  name: string;
  brand: string | null;
  stockQuantity: number;
  sellingPrice: number;
  categoryName: string | null;
}

export async function listProductsForSell(): Promise<SellableProduct[]> {
  return db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      stockQuantity: products.stockQuantity,
      sellingPrice: products.sellingPrice,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isArchived, false))
    .orderBy(products.name);
}

export interface MovementWithProduct {
  movement: typeof inventoryMovements.$inferSelect;
  productName: string;
}

export async function listMovements(
  options: { productId?: number; limit?: number } = {},
): Promise<MovementWithProduct[]> {
  const conditions: ReturnType<typeof eq>[] = [];
  if (options.productId !== undefined) {
    conditions.push(eq(inventoryMovements.productId, options.productId));
  }

  const query = db
    .select({ movement: inventoryMovements, productName: products.name })
    .from(inventoryMovements)
    .innerJoin(products, eq(inventoryMovements.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(inventoryMovements.createdAt));

  if (options.limit !== undefined) {
    query.limit(options.limit);
  }
  return query;
}

export interface SellResult {
  newStock: number;
  saleId: number;
  totalAmountPaisa: number;
}

/**
 * Record a sale atomically: validate stock, insert the sale + a SOLD movement,
 * then decrease stock. Stock can never go negative (validated + DB check).
 */
export async function sellProduct(
  productId: number,
  quantity: number,
  unitPricePaisa: number,
): Promise<SellResult> {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!row) {
      throw new Error("Product not found.");
    }
    if (row.isArchived) {
      throw new Error("Archived products cannot be sold.");
    }
    if (row.stockQuantity < quantity) {
      throw new Error(`Only ${row.stockQuantity} in stock.`);
    }

    const totalAmountPaisa = quantity * unitPricePaisa;

    const [sale] = await tx
      .insert(sales)
      .values({
        productId,
        quantity,
        sellingPrice: unitPricePaisa,
        purchasePrice: row.purchasePrice,
        totalAmount: totalAmountPaisa,
      })
      .returning();

    await tx.insert(inventoryMovements).values({
      productId,
      type: "SOLD",
      quantity: -quantity,
      unitPrice: unitPricePaisa,
      referenceId: sale.id,
    });

    const newStock = row.stockQuantity - quantity;
    await tx
      .update(products)
      .set({ stockQuantity: newStock, updatedAt: new Date() })
      .where(eq(products.id, productId));

    return { newStock, saleId: sale.id, totalAmountPaisa };
  });
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValuePaisa: number;
  salesToday: number;
  itemsSoldToday: number;
  revenueTodayPaisa: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const active = eq(products.isArchived, false);

  const [productStats] = await db
    .select({
      totalProducts: count(),
      totalStock: sql<number>`coalesce(sum(${products.stockQuantity}), 0)`,
      lowStock: sql<number>`coalesce(sum(case when ${products.stockQuantity} > 0 and ${products.stockQuantity} <= ${products.minimumStock} then 1 else 0 end), 0)`,
      outOfStock: sql<number>`coalesce(sum(case when ${products.stockQuantity} = 0 then 1 else 0 end), 0)`,
      inventoryValuePaisa: sql<number>`coalesce(sum(${products.purchasePrice} * ${products.stockQuantity}), 0)`,
    })
    .from(products)
    .where(active);

  const dayStart = startOfToday();
  const [saleStats] = await db
    .select({
      salesToday: count(),
      itemsSoldToday: sql<number>`coalesce(sum(${sales.quantity}), 0)`,
      revenueTodayPaisa: sql<number>`coalesce(sum(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        gte(sales.createdAt, new Date(dayStart)),
        lt(sales.createdAt, new Date(endOfToday())),
      ),
    );

  return {
    totalProducts: productStats.totalProducts,
    totalStock: productStats.totalStock,
    lowStock: productStats.lowStock,
    outOfStock: productStats.outOfStock,
    inventoryValuePaisa: productStats.inventoryValuePaisa,
    salesToday: saleStats.salesToday,
    itemsSoldToday: saleStats.itemsSoldToday,
    revenueTodayPaisa: saleStats.revenueTodayPaisa,
  };
}