export const INVOICE_STATUSES = ["draft", "sent", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const EFFECTIVE_STATUSES = ["draft", "sent", "paid", "overdue"] as const;
export type EffectiveStatus = (typeof EFFECTIVE_STATUSES)[number];

export const REMINDER_TONES = ["friendly", "firm", "final"] as const;
export type ReminderTone = (typeof REMINDER_TONES)[number];

export const NOTE_KINDS = ["description", "terms"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export const LOCALES = ["lt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type DocumentLanguage = Locale;

export const CURRENCY_CODES = ["EUR", "USD", "GBP", "INR", "CAD", "AUD", "JPY"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const AI_FEATURES = [
  "receipt_scan",
  "business_summary",
  "payment_reminder",
  "invoice_note",
] as const;
export type AiFeature = (typeof AI_FEATURES)[number];

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value);
}

export function isEffectiveStatus(value: string): value is EffectiveStatus {
  return (EFFECTIVE_STATUSES as readonly string[]).includes(value);
}

export function isReminderTone(value: string): value is ReminderTone {
  return (REMINDER_TONES as readonly string[]).includes(value);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isDocumentLanguage(value: string): value is DocumentLanguage {
  return isLocale(value);
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

/** BCP 47 tag for Intl (money, dates) from a UI or document language. */
export function intlLocale(locale?: string | null): string {
  return locale === "en" || locale?.startsWith("en") ? "en-US" : "lt-LT";
}

export interface User {
  id: string;
  email: string;
  name: string;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  user_id: string;
  company_name: string;
  logo_url: string;
  address: string;
  email: string;
  phone: string;
  currency: string;
  tax_rate: number;
  invoice_prefix: string;
  next_seq: number;
  accent_color: string;
  default_document_language: DocumentLanguage;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  notes: string;
  document_language: DocumentLanguage | null;
  created_at: string;
  updated_at: string;
  invoice_count?: number;
  total_billed?: number;
  outstanding?: number;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount?: number;
  position?: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  effective_status?: EffectiveStatus;
  issue_date: string;
  due_date: string | null;
  currency: string;
  tax_rate: number;
  discount: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string;
  terms: string;
  document_language: DocumentLanguage;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
  client_email?: string | null;
  client_company?: string | null;
  client_address?: string | null;
  items?: InvoiceItem[];
}

export interface InvoiceInput {
  client_id?: string | null;
  invoice_number?: string;
  status?: InvoiceStatus;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  tax_rate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  document_language?: DocumentLanguage;
  items?: Array<Pick<InvoiceItem, "description" | "quantity" | "rate">>;
}

export interface CatalogItem {
  id: string;
  user_id: string;
  name: string;
  description: string;
  rate: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  vendor: string;
  category: string;
  expense_date: string;
  amount: number;
  currency: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_id: string;
  amount: number;
  method: string;
  paid_on: string;
  notes: string;
  created_at: string;
  invoice_number?: string;
  invoice_total?: number;
  invoice_currency?: string;
  client_name?: string | null;
}

export interface DashboardStats {
  totalRevenue: number;
  outstanding: number;
  paidThisMonth: number;
  overdueCount: number;
  overdueTotal: number;
  invoiceCount: number;
  clientCount: number;
}

export interface RevenuePoint {
  label: string;
  ym: string;
  revenue: number;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueSeries: RevenuePoint[];
  recentInvoices: Invoice[];
}

export interface ReportsData {
  totals: {
    revenue: number;
    expenses: number;
    netProfit: number;
    outstanding: number;
    invoiceCount: number;
  };
  monthly: Array<{ label: string; ym: string; revenue: number; expenses: number }>;
  aging: Array<{ bucket: string; value: number }>;
  topClients: Array<{ id: string; name: string; billed: number; paid: number }>;
  statusBreakdown: Array<{ name: string; value: number; key: string }>;
}

export interface ReceiptParseResult {
  vendor: string;
  date: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  category: string;
  notes: string;
  lineItems: Array<{ description: string; quantity: number; rate: number }>;
}

export interface ApiErrorShape {
  status?: number;
  message: string;
  details?: unknown;
}
