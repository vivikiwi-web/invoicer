import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type { Locale } from "@shared/types";
import { isLocale } from "@shared/types";

import ltCommon from "@/locales/lt/common.json";
import ltNav from "@/locales/lt/nav.json";
import ltAuth from "@/locales/lt/auth.json";
import ltDashboard from "@/locales/lt/dashboard.json";
import ltInvoices from "@/locales/lt/invoices.json";
import ltClients from "@/locales/lt/clients.json";
import ltExpenses from "@/locales/lt/expenses.json";
import ltPayments from "@/locales/lt/payments.json";
import ltCatalog from "@/locales/lt/catalog.json";
import ltReports from "@/locales/lt/reports.json";
import ltSettings from "@/locales/lt/settings.json";
import ltPdf from "@/locales/lt/pdf.json";
import ltMarketing from "@/locales/lt/marketing.json";
import ltPricing from "@/locales/lt/pricing.json";
import ltFaq from "@/locales/lt/faq.json";
import ltLegal from "@/locales/lt/legal.json";
import ltConsent from "@/locales/lt/consent.json";
import ltErrors from "@/locales/lt/errors.json";

import enCommon from "@/locales/en/common.json";
import enNav from "@/locales/en/nav.json";
import enAuth from "@/locales/en/auth.json";
import enDashboard from "@/locales/en/dashboard.json";
import enInvoices from "@/locales/en/invoices.json";
import enClients from "@/locales/en/clients.json";
import enExpenses from "@/locales/en/expenses.json";
import enPayments from "@/locales/en/payments.json";
import enCatalog from "@/locales/en/catalog.json";
import enReports from "@/locales/en/reports.json";
import enSettings from "@/locales/en/settings.json";
import enPdf from "@/locales/en/pdf.json";
import enMarketing from "@/locales/en/marketing.json";
import enPricing from "@/locales/en/pricing.json";
import enFaq from "@/locales/en/faq.json";
import enLegal from "@/locales/en/legal.json";
import enConsent from "@/locales/en/consent.json";
import enErrors from "@/locales/en/errors.json";

export const LOCALE_STORAGE_KEY = "invoicer-locale";

export const I18N_NAMESPACES = [
  "common",
  "nav",
  "auth",
  "dashboard",
  "invoices",
  "clients",
  "expenses",
  "payments",
  "catalog",
  "reports",
  "settings",
  "pdf",
  "marketing",
  "pricing",
  "faq",
  "legal",
  "consent",
  "errors",
] as const;

const lt = {
  common: ltCommon,
  nav: ltNav,
  auth: ltAuth,
  dashboard: ltDashboard,
  invoices: ltInvoices,
  clients: ltClients,
  expenses: ltExpenses,
  payments: ltPayments,
  catalog: ltCatalog,
  reports: ltReports,
  settings: ltSettings,
  pdf: ltPdf,
  marketing: ltMarketing,
  pricing: ltPricing,
  faq: ltFaq,
  legal: ltLegal,
  consent: ltConsent,
  errors: ltErrors,
};

const en = {
  common: enCommon,
  nav: enNav,
  auth: enAuth,
  dashboard: enDashboard,
  invoices: enInvoices,
  clients: enClients,
  expenses: enExpenses,
  payments: enPayments,
  catalog: enCatalog,
  reports: enReports,
  settings: enSettings,
  pdf: enPdf,
  marketing: enMarketing,
  pricing: enPricing,
  faq: enFaq,
  legal: enLegal,
  consent: enConsent,
  errors: enErrors,
};

void i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { lt, en },
  fallbackLng: "lt",
  supportedLngs: ["lt", "en"],
  ns: [...I18N_NAMESPACES],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  detection: {
    order: ["localStorage"],
    lookupLocalStorage: LOCALE_STORAGE_KEY,
    caches: ["localStorage"],
  },
});

export function readStoredLocale(): Locale | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
  return raw && isLocale(raw) ? raw : null;
}

export function writeStoredLocale(locale: Locale) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function currentLocale(): Locale {
  const lng = (i18n.resolvedLanguage || i18n.language || "lt").slice(0, 2);
  return isLocale(lng) ? lng : "lt";
}

export default i18n;
