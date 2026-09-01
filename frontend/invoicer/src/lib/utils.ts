import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { intlLocale } from "@shared/types";
import i18n from "@/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function uiLocale(override?: string | null) {
  return intlLocale(override || i18n.resolvedLanguage || i18n.language || "lt");
}

export function formatNumber(
  n: number,
  opts: Intl.NumberFormatOptions = {},
  locale?: string,
) {
  return new Intl.NumberFormat(uiLocale(locale), opts).format(n);
}

export const CURRENCIES = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "CAD", symbol: "$" },
  { code: "AUD", symbol: "$" },
  { code: "JPY", symbol: "¥" },
];

export function formatMoney(
  amount: number | string | null | undefined,
  currency = "EUR",
  locale?: string,
) {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(uiLocale(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function formatDate(
  date?: string | Date | null,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
  locale?: string,
) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(uiLocale(locale), opts);
}

export function formatMonthLabel(ym: string, locale?: string) {
  const [year, month] = ym.split("-").map(Number);
  if (!year || !month) return ym;
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleDateString(uiLocale(locale), { month: "short", year: "numeric", timeZone: "UTC" });
}

export function toDateInput(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function errorMessage(err: unknown, fallback?: string) {
  let raw = "";
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    raw = err.message;
  }
  if (raw) {
    const mapped = i18n.t(`errors:map.${raw}`, { defaultValue: "" });
    if (mapped) return mapped;
    return raw;
  }
  return fallback || i18n.t("errors:generic", { defaultValue: "Request failed" });
}

export function relativeTime(date: string | Date, locale?: string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(uiLocale(locale), { numeric: "auto" });
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
  return d.toLocaleDateString(uiLocale(locale));
}
