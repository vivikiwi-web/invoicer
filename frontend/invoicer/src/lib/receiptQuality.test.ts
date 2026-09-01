import { describe, expect, it } from "vitest";
import { assessReceiptQuality } from "@shared/receiptQuality";

describe("assessReceiptQuality", () => {
  it("accepts a complete receipt", () => {
    const result = assessReceiptQuality({
      vendor: "Cafe UAB",
      date: "2026-03-15",
      currency: "EUR",
      subtotal: 10,
      tax: 2.1,
      total: 12.1,
      lineItems: [{ description: "Coffee", quantity: 1, rate: 10 }],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects empty vendor and zero total", () => {
    const result = assessReceiptQuality({
      vendor: "",
      total: 0,
      lineItems: [],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("vendor_empty");
    expect(result.reasons).toContain("total_not_positive");
  });
});
