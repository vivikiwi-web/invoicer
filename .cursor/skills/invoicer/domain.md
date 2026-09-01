# Domain

Single-user tenancy: every business record has `user_id`. There is no Organization entity. `company_settings` is 1:1 with `users`.

## Entities

**User** — `id`, `email`, `name`, `password_hash`, `token_version`, timestamps. Public JSON never includes the hash.

**CompanySettings** — per-user: `company_name`, `logo_url` (image data URL), `address`, `email`, `phone`, `currency` (default `USD`), `tax_rate` (percent, `NUMERIC(6,3)`), `invoice_prefix` (default `INV-`), `next_seq`, `accent_color`.

**Client** — belongs to a user. `name` required. Optional email/company/phone/address/notes. List payloads include `invoice_count`, `total_billed`, `outstanding`.

**Invoice** — belongs to a user; optional `client_id` (SET NULL on client delete). Unique `(user_id, invoice_number)`. Stored money: `discount` (flat amount), `subtotal`, `tax_amount`, `total` (`NUMERIC(12,2)`). `tax_rate` is percent. `paid_at` set when status becomes `paid`.

**InvoiceItem** — lines of an invoice: `description`, `quantity`, `rate`, `amount`, `position`. Amount is `round2(quantity * rate)` from `computeTotals`.

**CatalogItem** (products/services) — reusable name/description/rate/unit for the editor.

**Expense** — vendor, category (default `General`), date, amount, currency, notes. Optional origin: AI receipt parse.

**Payment** — against an owned invoice. Amount, method, `paid_on`, notes. Creating/deleting payments reconciles invoice status.

**Reports / Dashboard** — aggregated read models, not tables. See `shared/types.ts` (`DashboardData`, `ReportsData`).

## Invoice status

Stored: `draft | sent | paid` (`INVOICE_STATUSES`).

Effective (display): `draft | sent | paid | overdue`. Overdue is computed: `status === "sent"` and `due_date < today` (`effectiveStatus` in `shared/invoice.ts`). Never persist `overdue`.

Reminder tones: `friendly | firm | final`. Note kinds: `description | terms`.

## Money rules

Canonical implementation: `shared/invoice.ts`.

1. Line amount = `round2(quantity * rate)`
2. Subtotal = sum of line amounts, `round2`
3. Discount = flat amount, `round2`, capped at subtotal (not a percent)
4. Taxable base = `round2(subtotal - discount)`
5. Tax amount = `round2(taxableBase * taxRate / 100)` (`tax_rate` is percent, e.g. `8.5`)
6. Total = `round2(taxableBase + taxAmount)`

Use `round2` (EPSILON cents rounding). Do not leave raw IEEE floats in displayed or stored totals. Do not copy this arithmetic into pages.

Currency is a 3-letter code on the invoice/settings/expense. Display with `formatMoney(amount, currency)`.

Outstanding on a client/list = sum of invoice `total` where `status <> 'paid'`. Payments: if sum(payments) >= invoice total (> 0), mark invoice `paid`; otherwise if it was `paid`, revert to `sent`.

Invoice numbers: `Settings.nextInvoiceNumber` increments `next_seq` in a transaction (`INV-0001` style).

## AI domain

- Receipt parse → `ReceiptParseResult` (vendor, dates, totals, lineItems, category)
- Business summary → prose from the user's own aggregates
- Payment reminder → subject + body for one owned invoice
- Write note → invoice description or terms text

Treat model output as untrusted data.
