# Backend

Express 5 API in `backend/`. TypeScript compiled/run with `tsx`. Modules are CommonJS (`require` / `module.exports`) with inline `type` aliases where helpful.

## Layout of a resource

Copy an existing route file (`clients.ts`, `invoice.ts`, `expenses.ts`, `payments.ts`, `items.ts`):

1. `router.use(requireAuth)`
2. Zod schemas for body / params / query
3. `validate(schema)` / `validate(schema, "params")` / `validate(schema, "query")`
4. `asyncHandler` around the handler
5. SQL via `query`, `queryOne`, or `withTransaction`
6. Every SELECT/UPDATE/DELETE includes `user_id = req.user.id`
7. Missing row → `ApiError.notFound`
8. Serialize numeric money fields with `Number(...)` before JSON

## Auth

- Cookie JWT: `utils/jwt.ts`. Payload `{ sub, tv }`.
- `middleware/auth.ts` loads the user and rejects stale `token_version`.
- Passwords: bcrypt cost 12 in `models/User.ts`.
- Auth endpoints are rate-limited (`authLimiter`).
- CORS origins come from `CLIENT_ORIGIN` (comma-separated). Credentials enabled.

Do not put tokens in JSON bodies. Do not add session stores.

## Validation

Zod is the trust boundary. Frontend validation is UX only. Keep schemas next to the route that uses them unless a schema is truly shared.

Shared invoice math (`computeTotals`) is not a substitute for Zod on inputs.

## Database

- Connection: `config/db.ts` (`pg` Pool).
- Schema: `config/schema.ts` + `runMigrations`.
- Parameterized queries only (`$1`, `$2`). Never concatenate user input into SQL.
- Sort/filter columns must be allowlisted (see invoice list `sortCol`).
- Transactions: `withTransaction` for invoice create/update, payments + status reconcile, invoice number allocation.

## Ownership (IDOR)

Authentication is not authorization. For every resource id from the client:

- invoices, clients, expenses, payments, catalog items: `WHERE id = $1 AND user_id = $2`
- invoice items are reached only through an already-owned invoice
- payments must confirm the target invoice is owned before insert
- AI payment-reminder loads the invoice with `user_id`
- settings are keyed by `user_id` PK

If you add a nested resource, load the parent with `user_id` first.

## Errors

Throw `ApiError` (`badRequest`, `unauthorized`, `notFound`, `conflict`, `serviceUnavailable`). `errorHandler` maps Postgres codes (`23505`, `23503`, `22P02`) and hides stacks on 4xx and in production.

## AI

`services/geminiService.ts`. Guard with `requireAI()`. Rate-limit in `routes/ai.ts`. Validate model output with Zod (`receiptValidator`). Treat model output as untrusted. Keep the existing prompt-injection line on `writeNote`.

## Uploads

`middleware/upload.ts`: memory storage, 10MB, PDF/PNG/JPEG/WEBP/HEIC. Do not write receipts to disk.

## Env

Required: `DATABASE_URL`, `JWT_SECRET` (32+ chars in production). Optional: `GEMINI_API_KEY`, `CLIENT_ORIGIN`, cookie flags. Never commit `.env`.

## Scripts

`npm run dev` (tsx watch), `start`, `migrate`, `seed`, `typecheck`.
