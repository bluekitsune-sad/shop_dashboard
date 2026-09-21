import { describe, expect, it } from "vitest";

import { getStockStatus } from "@/lib/stock";

describe("getStockStatus", () => {
  it("returns IN_STOCK when stock exceeds minimum", () => {
    expect(getStockStatus(8, 3)).toBe("IN_STOCK");
    expect(getStockStatus(10, 0)).toBe("IN_STOCK");
  });

  it("returns LOW_STOCK when 0 < stock <= minimum", () => {
    expect(getStockStatus(3, 3)).toBe("LOW_STOCK");
    expect(getStockStatus(1, 5)).toBe("LOW_STOCK");
  });

  it("returns OUT_OF_STOCK when stock is zero", () => {
    expect(getStockStatus(0, 5)).toBe("OUT_OF_STOCK");
    expect(getStockStatus(-1, 5)).toBe("OUT_OF_STOCK");
  });
});