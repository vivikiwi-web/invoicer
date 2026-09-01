import { describe, expect, it } from "vitest";
import { errorMessage, formatDate, formatMoney, toDateInput } from "./utils";
import { isInvoiceStatus, isReminderTone } from "@shared/types";

describe("formatMoney", () => {
  it("formats USD with two fraction digits", () => {
    expect(formatMoney(1234.5, "USD", "en")).toBe("$1,234.50");
  });

  it("treats null as zero", () => {
    expect(formatMoney(null, "USD", "en")).toBe("$0.00");
  });

  it("defaults to EUR", () => {
    expect(formatMoney(10, undefined, "en")).toBe("€10.00");
  });
});

describe("formatDate / toDateInput", () => {
  it("returns an em dash for empty dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(toDateInput(undefined)).toBe("");
  });

  it("formats a valid ISO date for inputs", () => {
    expect(toDateInput("2026-03-15T12:00:00.000Z")).toBe("2026-03-15");
  });
});

describe("errorMessage", () => {
  it("reads message from error-shaped objects", () => {
    expect(errorMessage({ message: "Nope" })).toBe("Nope");
    expect(errorMessage("x", "fallback")).toBe("fallback");
  });
});

describe("shared type guards", () => {
  it("accepts real invoice statuses only", () => {
    expect(isInvoiceStatus("draft")).toBe(true);
    expect(isInvoiceStatus("overdue")).toBe(false);
    expect(isReminderTone("firm")).toBe(true);
    expect(isReminderTone("angry")).toBe(false);
  });
});

describe("formatDate locale", () => {
  it("formats with the given locale", () => {
    const label = formatDate("2026-03-15T12:00:00.000Z", { month: "short", year: "numeric" }, "en");
    expect(label).toMatch(/2026/);
  });
});
