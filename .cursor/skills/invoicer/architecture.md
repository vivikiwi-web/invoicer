# Architecture

Invoicer is a two-package TypeScript SaaS: a Vite React SPA and an Express API over PostgreSQL. There is no Next.js, no ORM, no Redux, and no multi-tenant organization table. One user owns all of their business data.

## Folders

```
backend/                 Express API (CommonJS + tsx)
  src/server.ts          App bootstrap, middleware, route mount
  src/config/            env, pg pool, schema SQL, migrations
  src/middleware/        auth, validate (Zod), rateLimit, upload, errors
  src/models/            User, Settings (thin SQL helpers)
  src/routes/            One router per resource
  src/services/          geminiService (AI)
  src/utils/             jwt, invoice serialize, ApiError, asyncHandler
  scripts/               migrate.ts, seed.ts
frontend/invoicer/       Vite + React SPA
  src/api/               Axios resource modules
  src/hooks/             TanStack Query hooks
  src/context/           Auth, Theme, UI (toasts)
  src/components/ui      Design-system primitives
  src/components/layout  AppShell, Sidebar, Topbar, CommandPalette
  src/pages/             Route screens
  src/lib/utils.ts       cn, formatMoney, formatDate
shared/                  Cross-package types and invoice math
```

## Dependency direction

```
UI (pages, layout, ui)
  → hooks (useInvoices, useClients, useFeatures, …)
    → api/* (invoicesApi, clientsApi, apiClient)
      → Express /api/*
        → requireAuth + Zod validate
          → models / query() / withTransaction() / geminiService
            → PostgreSQL
```

Shared types flow inward from `shared/types.ts` (`@shared/types` on the frontend). Invoice arithmetic lives in `shared/invoice.ts`.

Do not invert this. Pages must not call Axios directly when a hook exists. Hooks must not embed SQL-shaped logic. Routes must not skip `user_id` filters.

## Frontend architecture

- Entry: `src/main.tsx` → `App.tsx`
- Providers (outside-in): QueryClient → MotionConfig → Theme → UI (toasts) → Auth → Router
- Routing: `src/routes.tsx` via `createBrowserRouter`
  - Public: `/`, `/login`, `/register`
  - Protected shell: `/dashboard`, `/invoices`, `/invoices/new`, `/invoices/:id`, `/invoices/:id/edit`, `/clients`, `/clients/:id`, `/expenses`, `/payments`, `/items`, `/reports`, `/settings`
- Server state: TanStack Query (staleTime 30s, retry 1, no refetchOnWindowFocus)
- Client state: React context only (auth user, theme, toasts). No extra store.
- HTTP: one Axios instance `src/api/client.ts` (`baseURL: "/api"`, `withCredentials: true`). Vite proxies `/api` to `http://localhost:8000`.
- PDF: `@react-pdf/renderer` in `components/invoice/InvoiceDocument.tsx` (client-side download, not a backend PDF service).

## Backend architecture

- Express 5 app in `server.ts`: Helmet, CORS (`CLIENT_ORIGIN`, credentials), JSON 200kb limit, cookie-parser, Morgan in non-prod.
- Routes mounted at `/api/{health,auth,clients,invoices,dashboard,reports,settings,items,expenses,payments,ai}`.
- Auth: httpOnly JWT cookie (`COOKIE_NAME`, default `aimb_token`). `requireAuth` verifies JWT, loads the user, checks `token_version`.
- Validation: Zod via `middleware/validate.ts` on bodies/params/query. This is the security boundary; frontend checks are UX only.
- DB: `pg` Pool, parameterized SQL only. Schema in `config/schema.ts`, applied by `runMigrations`.
- Errors: `ApiError` + `errorHandler`. 5xx stacks only in non-prod.

## Authentication

- Register / login issue a cookie JWT with `{ sub, tv }` (`tv` = `users.token_version`).
- `/auth/me`, `/auth/profile`, `/auth/password` require auth.
- Password change increments `token_version` and re-issues the cookie (other sessions die).
- Logout clears the cookie; it does not bump `token_version`.
- SPA: `AuthContext` calls `/auth/me` on boot. Axios interceptor sends 401s (except auth probes) to `/login`.

There is no Organization / workspace / role model. Tenancy is `users.id` → `user_id` on every resource.

## Domain surfaces

| Area | Frontend | Backend |
|---|---|---|
| Auth | `api/auth.ts`, `AuthContext` | `routes/auth.ts`, `models/User.ts` |
| Invoices | `hooks/useInvoices.ts`, Invoice pages, PDF | `routes/invoice.ts`, `shared/invoice.ts` |
| Clients | `hooks/useClients.ts`, Clients pages, `ClientFormModal` | `routes/clients.ts` |
| Catalog items | `useItems` in `useFeatures.ts` | `routes/items.ts` |
| Expenses | `useExpenses` | `routes/expenses.ts` |
| Payments | `usePayments` | `routes/payments.ts` (also reconciles invoice status) |
| Dashboard | `useDashboard` | `routes/dashboard.ts` |
| Reports | `useReports` | `routes/reports.ts` |
| Settings | `useSettings` | `routes/settings.ts`, `models/Settings.ts` |
| AI | `api/ai.ts` | `routes/ai.ts`, `services/geminiService.ts` |
| Uploads | receipt dropzone on Expenses / Invoice editor | `middleware/upload.ts` (memory, 10MB, PDF/images) |

## AI

Gemini (`@google/genai`) behind `GEMINI_API_KEY`. Endpoints are authenticated + `aiLimiter` (15/min). Features: receipt parse, business summary, payment reminder, invoice note writer. Receipt JSON is Zod-validated after the model returns.

## File uploads

Receipts stay in memory and are sent to Gemini. Company logos are data URLs stored in `company_settings.logo_url` (must start with `data:image/`, max 80k chars). No public upload directory is part of the runtime API.

## What not to add

No Prisma/Drizzle unless explicitly requested. No Next.js. No second query library. No microservice split. Keep the current two-process layout.
