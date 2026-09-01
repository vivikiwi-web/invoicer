---
name: invoicer
description: >-
  Project skill for the Invoicer SaaS (Vite + React + Express + PostgreSQL).
  Use when implementing, reviewing, or changing any Invoicer feature: invoices,
  clients, payments, expenses, reports, settings, AI, auth, UI, API, or tests.
  Teaches agents to search, reuse, and extend the existing codebase instead of
  generating duplicate abstractions.
---

# Invoicer

You are a senior engineer working in an existing production-bound SaaS. Do not rebuild the app. Do not invent a parallel architecture.

## Before generating code

1. Search for an existing implementation
2. Reuse existing components
3. Reuse existing hooks
4. Reuse shared TypeScript types
5. Reuse utilities
6. Follow existing API patterns
7. Follow existing UI/design patterns
8. Avoid duplicate abstractions
9. Avoid `any`
10. Avoid creating one-off inconsistent components

Workflow: **SEARCH → UNDERSTAND → REUSE → EXTEND → TEST**. Never **GENERATE → DUPLICATE → PATCH**.

Prefer modifying an existing abstraction over introducing a competing one. Do not add repositories, DI, event buses, extra state libraries, wrapper components, or one-line custom hooks.

## Supporting docs

Read these when the task needs deeper context:

- [architecture.md](architecture.md) — folders, dependency direction, routing, auth, data flow
- [frontend.md](frontend.md) — React, TypeScript, hooks, API client, components
- [backend.md](backend.md) — Express routes, Zod, ownership, services
- [design-system.md](design-system.md) — tokens, layout, UI/UX constraints
- [domain.md](domain.md) — entities, invoice states, money rules
- [testing.md](testing.md) — Vitest and Playwright conventions

Also use installed skills when relevant: TypeScript, Vercel React, UI/UX Pro MAX, web-design-guidelines, 21st CLI, animate / review-animations, security-audit, api-security-best-practices, vitest, playwright.

## Stack (actual)

- Frontend: Vite, React 19, TypeScript, Tailwind 4, TanStack Query, Axios, React Router 7, Motion (`motion/react`), Recharts, `@react-pdf/renderer`
- Backend: Express 5, TypeScript (CJS + `tsx`), PostgreSQL (`pg`), Zod, JWT httpOnly cookie, Helmet, bcrypt, Multer, Gemini
- Shared: `shared/types.ts`, `shared/invoice.ts`

## Dependency direction

```
UI pages/components
  → hooks (TanStack Query)
    → api/* (Axios apiClient)
      → Express /api/*
        → models / parameterized SQL / services
          → PostgreSQL
```

Do not fetch in random components. Do not add a second HTTP client. Do not add another router.

## Money

Invoice totals live in `shared/invoice.ts` (`computeTotals`, `round2`, `effectiveStatus`). Backend `backend/src/utils/invoice.ts` re-exports that math and serializes DB rows. Do not reimplement VAT/discount/total arithmetic in UI.

## UI

Reuse `frontend/invoicer/src/components/ui` primitives. Search 21st.dev only for sophisticated components that do not exist, then adapt them to this design system. Do not create `Button2` / `NewButton` / `ModernButton`.

This is a dense B2B invoicing product: clarity, speed, hierarchy, consistency, accessibility. No marketing-page chrome on dashboard screens.

## Auth vs authorization

Cookie JWT authenticates. Every invoice, client, payment, expense, item, and settings query must also filter by `req.user.id`. Authentication is not authorization.

## Motion

Use `motion/react`. Keep animation subtle, fast, functional. Respect `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` is already set). Do not add decorative motion.
