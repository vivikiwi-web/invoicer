import { isCurrencyCode } from "./types";

export interface ReceiptQualityInput {
  vendor?: string;
  date?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  lineItems?: Array<{ description?: string; quantity?: number; rate?: number }>;
}

export interface ReceiptQualityResult {
  ok: boolean;
  reasons: string[];
}

function isPlausibleIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const year = d.getUTCFullYear();
  return year >= 1990 && year <= new Date().getUTCFullYear() + 1;
}

/** Semantic checks after schema parse. Valid JSON is not enough to trust a receipt. */
export function assessReceiptQuality(data: ReceiptQualityInput): ReceiptQualityResult {
  const reasons: string[] = [];
  const vendor = (data.vendor || "").trim();
  const total = Number(data.total) || 0;
  const subtotal = Number(data.subtotal) || 0;
  const tax = Number(data.tax) || 0;
  const currency = (data.currency || "").trim().toUpperCase();
  const date = (data.date || "").trim();
  const items = data.lineItems || [];

  if (!vendor) reasons.push("vendor_empty");
  if (!(total > 0)) reasons.push("total_not_positive");

  if (subtotal > 0 || tax > 0) {
    const expected = Math.round((subtotal + tax) * 100) / 100;
    const actual = Math.round(total * 100) / 100;
    if (Math.abs(expected - actual) > 0.05 && Math.abs(expected - actual) > actual * 0.02) {
      reasons.push("totals_mismatch");
    }
  }

  if (currency && !isCurrencyCode(currency)) reasons.push("currency_unsupported");
  if (date && !isPlausibleIsoDate(date)) reasons.push("date_implausible");

  for (const [i, item] of items.entries()) {
    const description = (item.description || "").trim();
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    if (!description) reasons.push(`line_${i}_description`);
    if (!(quantity > 0)) reasons.push(`line_${i}_quantity`);
    if (rate < 0 || Number.isNaN(rate)) reasons.push(`line_${i}_rate`);
  }

  return { ok: reasons.length === 0, reasons };
}
