import { describe, expect, it } from "vitest";
import { computeTotals, effectiveStatus, round2 } from "@shared/invoice";

describe("round2", () => {
  it("rounds half-up to cents", () => {
    expect(round2(10.126)).toBe(10.13);
    expect(round2(2.5)).toBe(2.5);
    expect(round2(10)).toBe(10);
  });
});

describe("computeTotals", () => {
  it("computes line amounts, subtotal, flat discount, percent tax, and total", () => {
    const result = computeTotals(
      [
        { description: "Design", quantity: 2, rate: 100 },
        { description: "Dev", quantity: 1, rate: 50.5 },
      ],
      10,
      20,
    );

    expect(result.items[0].amount).toBe(200);
    expect(result.items[1].amount).toBe(50.5);
    expect(result.subtotal).toBe(250.5);
    expect(result.discount).toBe(20);
    expect(result.taxAmount).toBe(23.05);
    expect(result.total).toBe(253.55);
  });

  it("caps discount at subtotal", () => {
    const result = computeTotals([{ quantity: 1, rate: 40 }], 8.5, 100);
    expect(result.discount).toBe(40);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it("treats missing items as empty", () => {
    const result = computeTotals(undefined, 21, 0);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });
});

describe("effectiveStatus", () => {
  it("keeps paid invoices paid even if the due date is in the past", () => {
    expect(effectiveStatus({ status: "paid", due_date: "2000-01-01" })).toBe("paid");
  });

  it("marks sent invoices overdue after the due date", () => {
    expect(effectiveStatus({ status: "sent", due_date: "2000-01-01" })).toBe("overdue");
  });

  it("does not mark draft invoices overdue", () => {
    expect(effectiveStatus({ status: "draft", due_date: "2000-01-01" })).toBe("draft");
  });
});
