import { sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { check, index, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

import { MOVEMENT_TYPES } from "@/lib/constants";

export const categories = sqliteTable(
  "categories",
  (t) => ({
    id: t.integer("id").primaryKey({ autoIncrement: true }),
    name: t.text("name").notNull(),
    parentId: t
      .integer("parent_id")
      .references((): SQLiteColumn => categories.id, { onDelete: "set null" }),
    createdAt: t
      .integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: t
      .integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [uniqueIndex("categories_name_parent_unique").on(t.name, t.parentId)],
);

export const products = sqliteTable(
  "products",
  (t) => ({
    id: t.integer("id").primaryKey({ autoIncrement: true }),
    categoryId: t.integer("category_id").notNull().references(() => categories.id),
    name: t.text("name").notNull(),
    brand: t.text("brand"),
    sku: t.text("sku"),
    purchasePrice: t.integer("purchase_price").notNull().default(0),
    sellingPrice: t.integer("selling_price").notNull().default(0),
    stockQuantity: t.integer("stock_quantity").notNull().default(0),
    minimumStock: t.integer("minimum_stock").notNull().default(0),
    imageUrl: t.text("image_url"),
    notes: t.text("notes"),
    isArchived: t.integer("is_archived", { mode: "boolean" }).notNull().default(false),
    createdAt: t
      .integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: t
      .integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    uniqueIndex("products_sku_unique").on(t.sku),
    index("products_category_id_idx").on(t.categoryId),
    check("products_stock_non_negative", sql`${t.stockQuantity} >= 0`),
  ],
);

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const inventoryMovements = sqliteTable(
  "inventory_movements",
  (t) => ({
    id: t.integer("id").primaryKey({ autoIncrement: true }),
    productId: t.integer("product_id").notNull().references(() => products.id),
    type: t.text("type").$type<MovementType>().notNull(),
    quantity: t.integer("quantity").notNull(),
    unitPrice: t.integer("unit_price"),
    reason: t.text("reason"),
    referenceId: t.integer("reference_id"),
    createdAt: t
      .integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    index("inventory_movements_product_id_idx").on(t.productId),
    check(
      "inventory_movements_type_valid",
      sql`${t.type} in ('STOCK_ADDED', 'SOLD', 'ADJUSTMENT')`,
    ),
  ],
);

export const sales = sqliteTable(
  "sales",
  (t) => ({
    id: t.integer("id").primaryKey({ autoIncrement: true }),
    productId: t.integer("product_id").notNull().references(() => products.id),
    quantity: t.integer("quantity").notNull(),
    sellingPrice: t.integer("selling_price").notNull(),
    purchasePrice: t.integer("purchase_price").notNull(),
    totalAmount: t.integer("total_amount").notNull(),
    createdAt: t
      .integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  }),
  (t) => [
    index("sales_product_id_idx").on(t.productId),
    index("sales_created_at_idx").on(t.createdAt),
  ],
);

/** Simple key/value store for app settings (e.g. the shop PIN when it is
 * changed from the UI). */
export const settings = sqliteTable("settings", (t) => ({
  key: t.text("key").primaryKey(),
  value: t.text("value").notNull(),
  updatedAt: t
    .integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
}));