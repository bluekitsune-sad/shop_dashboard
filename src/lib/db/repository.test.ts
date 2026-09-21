import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const sourceDb = path.resolve(here, "../../../data/shop.db");
const sourceDbExists = fs.existsSync(sourceDb);

/**
 * Repository functions talk to the singleton in @/lib/db, which reads
 * DATABASE_URL at import time. Point it at a throwaway copy of the real
 * dev database so tests exercise the true schema (FKs, checks) and never
 * mutate the developer's data. Skipped automatically when no dev DB exists.
 */
let repo: typeof import("@/lib/db/repository");
let db: typeof import("@/lib/db");
let tmpDir: string | undefined;

beforeAll(async () => {
  if (!sourceDbExists) return;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shop-repo-test-"));
  fs.copyFileSync(sourceDb, path.join(tmpDir, "shop.db"));
  process.env.DATABASE_URL = `file:${path.join(tmpDir, "shop.db")}`;
  vi.resetModules();
  db = await import("@/lib/db");
  repo = await import("@/lib/db/repository");
});

afterAll(() => {
  try {
    (db as { $client?: { close?: () => void } } | undefined)?.$client?.close?.();
  } finally {
    delete process.env.DATABASE_URL;
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch {
        // Windows can briefly hold a lock on the recently-closed file; leftover
        // temp dirs are harmless and live under the OS temp directory.
      }
    }
  }
});

const describeOrSkip = sourceDbExists ? describe : describe.skip;

describeOrSkip("repository (sell + movements, against a DB copy)", () => {
  it("createProduct records an initial STOCK_ADDED movement", async () => {
    const categories = await repo.listCategories();
    const product = await repo.createProduct({
      name: `Test Phone ${Date.now()}`,
      categoryId: categories[0].id,
      brand: undefined,
      sku: undefined,
      purchasePrice: 100,
      sellingPrice: 150,
      stockQuantity: 5,
      minimumStock: 1,
      imageUrl: undefined,
      notes: undefined,
    });

    const movements = await repo.listMovements({ productId: product.id });
    expect(movements).toHaveLength(1);
    expect(movements[0].movement.type).toBe("STOCK_ADDED");
    expect(movements[0].movement.quantity).toBe(5);
  });

  it("sellProduct atomically drops stock, records a SOLD movement and a sale", async () => {
    const categories = await repo.listCategories();
    const product = await repo.createProduct({
      name: `Sell Test ${Date.now()}`,
      categoryId: categories[0].id,
      brand: undefined,
      sku: undefined,
      purchasePrice: 8000,
      sellingPrice: 10000,
      stockQuantity: 10,
      minimumStock: 1,
      imageUrl: undefined,
      notes: undefined,
    });

    const salesBefore = (await repo.getDashboardStats()).salesToday;
    const result = await repo.sellProduct(product.id, 3, 10000);
    expect(result.newStock).toBe(7);
    expect(result.totalAmountPaisa).toBe(30000);

    const movements = await repo.listMovements({ productId: product.id });
    expect(movements).toHaveLength(2);
    const sold = movements[0].movement;
    expect(sold.type).toBe("SOLD");
    expect(sold.quantity).toBe(-3);
    expect(sold.referenceId).toBe(result.saleId);

    const salesAfter = (await repo.getDashboardStats()).salesToday;
    expect(salesAfter - salesBefore).toBeGreaterThanOrEqual(1);
  });

  it("refuses to sell more than is in stock", async () => {
    const categories = await repo.listCategories();
    const product = await repo.createProduct({
      name: `Over Sell ${Date.now()}`,
      categoryId: categories[0].id,
      brand: undefined,
      sku: undefined,
      purchasePrice: 100,
      sellingPrice: 150,
      stockQuantity: 2,
      minimumStock: 0,
      imageUrl: undefined,
      notes: undefined,
    });

    await expect(repo.sellProduct(product.id, 3, 15000)).rejects.toThrow(/Only 2 in stock/);
  });

  it("refuses to sell an archived product", async () => {
    const categories = await repo.listCategories();
    const product = await repo.createProduct({
      name: `Archived Sell ${Date.now()}`,
      categoryId: categories[0].id,
      brand: undefined,
      sku: undefined,
      purchasePrice: 100,
      sellingPrice: 150,
      stockQuantity: 5,
      minimumStock: 0,
      imageUrl: undefined,
      notes: undefined,
    });
    await repo.setProductArchived(product.id, true);

    await expect(repo.sellProduct(product.id, 1, 15000)).rejects.toThrow(/Archived products cannot be sold/);
  });
});