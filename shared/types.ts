export type InvoiceStatus = "draft" | "sent" | "paid";
export type EffectiveStatus = InvoiceStatus | "overdue";
export type ReminderTone = "friendly" | "firm" | "final";
export type NoteKind = "description" | "terms";

export interface User {
  id: string;
  email: string;
  name: string;
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
