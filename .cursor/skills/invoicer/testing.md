# Testing

## Unit (Vitest)

Configured in the frontend Vite app (`frontend/invoicer`).

```bash
cd frontend/invoicer
npm test          # watch
npm run test:run  # CI
```

Prioritize pure logic:

- `shared/invoice.ts` — `round2`, `computeTotals`, `effectiveStatus`
- `src/lib/utils.ts` — `formatMoney`, `formatDate`, `toDateInput`, `errorMessage`
- Validators / type guards in `shared/types.ts`

Do not unit-test every visual component. Do not mock TanStack Query for trivial tests.

Put tests next to the code or under `src/**/*.test.ts`. Import `@shared/invoice` and `@/lib/utils`.

When you change invoice math, update these tests in the same change.

## E2E (Playwright)

```bash
cd frontend/invoicer
npm run test:e2e
```

Config: `playwright.config.ts`. Default base URL: `http://127.0.0.1:5174` (dedicated Vite process). Override with `PLAYWRIGHT_BASE_URL` / `PLAYWRIGHT_PORT`. In CI a fresh server is always started.

Authenticated flows need a **local/dev** backend and:

```
E2E_EMAIL=...
E2E_PASSWORD=...
```

Never point destructive tests at production. Never commit credentials. Seed demo user exists only in `backend/scripts/seed.ts` for local use.

Smoke coverage (see `e2e/smoke.spec.ts`):

- landing renders
- login page renders
- if credentials are set: login → dashboard → clients → invoices

Skip mutating production-like data unless the environment is clearly local.

## Scripts

| Script | Where | Purpose |
|---|---|---|
| `lint` | frontend | ESLint |
| `typecheck` | frontend + backend | `tsc --noEmit` |
| `build` | frontend | typecheck + Vite production build |
| `test` / `test:run` | frontend | Vitest |
| `test:e2e` | frontend | Playwright |

Fix failures caused by your change. Do not disable lint/type rules to hide errors.
