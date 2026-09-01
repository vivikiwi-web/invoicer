# Frontend

SPA: `frontend/invoicer`. Strict TypeScript (`strict: true`). `noImplicitAny` is still false — do not use that as permission to add `any`. Prefer tightening types at the file you touch.

## TypeScript

- Functional components only.
- Avoid `any`. Avoid unnecessary `as`. Prefer type guards in `shared/types.ts` (`isInvoiceStatus`, `isEffectiveStatus`, `isReminderTone`).
- Prefer inferred types for local UI state. Put explicit types on API/domain boundaries (`User`, `Invoice`, `InvoiceInput`, Axios response generics).
- Import domain types from `@shared/types`, invoice math from `@shared/invoice`.
- Path aliases: `@/*` → `src/*`, `@shared/*` → `../../shared/*`.

## Data fetching

Server state goes through TanStack Query hooks:

- `useInvoices` / `useInvoice` / mutations — `hooks/useInvoices.ts`
- `useClients` / `useClient` — `hooks/useClients.ts`
- `useDashboard`, `useSettings`
- items, expenses, payments, reports — `hooks/useFeatures.ts`

Do not `axios`/`fetch` inside pages when a hook exists. Do not add React Query alternatives.

Invalidate related keys after mutations (existing pattern already invalidates invoices + dashboard + clients together).

## API client

One Axios instance: `src/api/client.ts`. Resource modules (`api/invoices.ts`, `api/clients.ts`, `api/auth.ts`, `api/features.ts`, `api/ai.ts`, `api/settings.ts`, `api/dashboard.ts`) wrap it and type the JSON body.

Cookie auth: `withCredentials: true`. Do not store JWTs in `localStorage`.

## Routing

React Router 7 `createBrowserRouter` in `src/routes.tsx`. Protected routes render `AppShell`. Guest-only login/register redirect when `user` exists. Do not add another router.

## Components

Before creating a component, check:

1. `src/components/ui`
2. `src/components/layout`
3. feature folders (`components/invoice`, `components/clients`, `components/auth`, `components/dashboard`)
4. 21st.dev (`21st-cli-use`) only for sophisticated missing pieces, then restyle to this system

Existing primitives: `Button`, `IconButton`, `Input` / `SearchInput`, `Checkbox`, `Tabs`, `Card`, `Badge` / `StatusBadge`, `EmptyState`, `Skeleton`, `Avatar`. Toasts live in `UIContext`. Modals: `ClientFormModal` (follow this dialog pattern). Command palette: `CommandPalette`.

Do not create `Button2`, `NewButton`, `CustomButton`, `ModernButton`. Extend CVA variants on the existing primitive.

## UX consistency

- Loading: spinner + muted text, or `Skeleton`.
- Empty: `EmptyState`.
- Errors: `errorMessage()` + toast (`useToast().error`) or inline form `err` string.
- Forms: labeled fields (`<label>` wrapping control, as in `ClientFormModal`). Native submit buttons with `type="submit"`; other buttons `type="button"`.
- Money display: `formatMoney` from `lib/utils.ts`. Totals: `computeTotals` from `@shared/invoice`.
- Dates: `formatDate` / `toDateInput`.

## Accessibility

Prefer native HTML. Add ARIA only when native semantics are insufficient (dialogs, tabs, live toasts). Visible focus rings already exist on Button/Input. Icon-only controls need `title` or `aria-label`. Respect reduced motion (MotionConfig is global).

## Animation

Import from `motion/react`. Keep motion subtle and short. Do not reintroduce `framer-motion`.

## Lint

ESLint parses TypeScript via `typescript-eslint`. Compiler-oriented `react-hooks` rules (`set-state-in-effect`, `immutability`, `refs`) are off because they fire on existing valid patterns (toasts, context). Do not turn them back on as part of an unrelated change. Fix real errors; do not disable extra rules to hide new issues.
