import { describe, expect, it } from "vitest";

import { formatMoney, paisaFromRupees, rupeesFromPaisa } from "@/lib/money";

describe("money (paisa)", () => {
  it("converts rupees to paisa exactly", () => {
    expect(paisaFromRupees(0)).toBe(0);
    expect(paisaFromRupees(1)).toBe(100);
    expect(paisaFromRupees(12.5)).toBe(1250);
    expect(paisaFromRupees(99.99)).toBe(9999);
  });

  it("converts paisa back to rupees", () => {
    expect(rupeesFromPaisa(1250)).toBe(12.5);
    expect(rupeesFromPaisa(0)).toBe(0);
  });

  it("round-trips without floating point drift", () => {
    expect(rupeesFromPaisa(paisaFromRupees(1234.56))).toBe(1234.56);
  });

  it("formats whole amounts without decimals", () => {
    expect(formatMoney(125000)).toBe("Rs 1,250");
  });

  it("formats fractional amounts with two decimals", () => {
    expect(formatMoney(125050)).toBe("Rs 1,250.50");
  });
});