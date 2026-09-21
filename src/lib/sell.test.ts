import { describe, expect, it } from "vitest";

import { sellFormSchema, type SellFormOutput } from "@/lib/validation";

const valid = {
  productId: "4",
  quantity: "2",
  unitPrice: "1500",
};

describe("sell form validation", () => {
  it("accepts a valid sale", () => {
    const result = sellFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      const output = result.data satisfies SellFormOutput;
      expect(output).toEqual({ productId: 4, quantity: 2, unitPrice: 1500 });
    }
  });

  it("rejects a missing product", () => {
    expect(sellFormSchema.safeParse({ ...valid, productId: "" }).success).toBe(false);
  });

  it("rejects a non-numeric product id", () => {
    expect(sellFormSchema.safeParse({ ...valid, productId: "abc" }).success).toBe(false);
  });

  it("rejects a zero or negative quantity", () => {
    expect(sellFormSchema.safeParse({ ...valid, quantity: "0" }).success).toBe(false);
    expect(sellFormSchema.safeParse({ ...valid, quantity: "-3" }).success).toBe(false);
  });

  it("rejects a fractional quantity", () => {
    expect(sellFormSchema.safeParse({ ...valid, quantity: "2.5" }).success).toBe(false);
  });

  it("rejects an empty or negative unit price", () => {
    expect(sellFormSchema.safeParse({ ...valid, unitPrice: "" }).success).toBe(false);
    expect(sellFormSchema.safeParse({ ...valid, unitPrice: "-1" }).success).toBe(false);
  });

  it("allows a zero unit price (free item)", () => {
    expect(sellFormSchema.safeParse({ ...valid, unitPrice: "0" }).success).toBe(true);
  });
});