# Design system

Extracted from the current UI. Do not invent a new visual identity. Make screens more consistent with this system.

## Personality

Professional B2B invoicing SaaS. Dense information, not a marketing landing page (the public `/` landing may be more expressive; authenticated app chrome must stay calm).

UX order: clarity → speed → hierarchy → consistency → accessibility → predictable interaction → density without clutter.

Avoid: excessive gradients, stacked cards-in-cards, oversized dashboard headings, random accent colors, loud shadows, decorative animation, everything looking like a startup landing page.

## Color tokens (`src/index.css`)

Light (`:root` / `data-theme="light"`):

- `--bg: #f5f9f8` page
- `--surface: #ffffff` cards / inputs
- `--surface-2: #f2f8f6` muted wells
- `--border: rgba(13, 42, 37, 0.07)`
- `--ink: #0c1a17` text
- `--ink-muted: #5c7570`
- `--accent: #0d9488` teal
- `--accent-strong: #0f766e`
- `--accent-soft: #d3f4ec`
- `--success: #059669` / `--warning: #d97706` / `--danger: #e11d48`

Dark (`data-theme="dark"`): forest-dark surfaces (`#08120f`, `#0f1e1a`) with brighter teal accent (`#2dd4bf`).

Use `var(--token)` or Tailwind theme colors (`bg-bg`, `text-ink`, `border-border`, `bg-accent`). Do not introduce a second palette.

## Typography

- Sans / UI: Inter (`--font-sans`)
- Display headings: Geist (`font-display`, tracking `-0.02em`)
- Serif accent (auth/marketing only): Cormorant Garamond (`font-serif`)
- Tabular numbers: class `tabular`
- Page titles: `font-display text-2xl font-semibold tracking-tight`
- Body: `text-sm`; meta: `text-xs text-[var(--ink-muted)]`

Do not use giant display type on dashboard tables.

## Shape, space, elevation

- Cards: `rounded-2xl` / `rounded-3xl`, `border`, `shadow-card`; hover `shadow-hover`
- Pills: `rounded-full` (buttons, inputs, tabs, badges)
- `--radius-card: 20px`
- Shadows are soft and green-tinted in light mode — do not add heavy drop shadows
- App content: `px-6 md:px-8 py-6`, max width `1600px`

## Layout chrome

- Sidebar: collapsed icon rail `w-[88px]`, hover expands to `248px`, `rounded-3xl`, sticky. Active item: ink fill on a rounded square.
- Topbar: greeting `h1` + search that opens the command palette (`⌘K` / `Ctrl+K`) + theme toggle + notifications.
- Page header: `PageHeader` (title + description + actions).

## Components

- **Button**: CVA variants `primary` (ink), `accent` (teal), `outline`, `ghost`, `soft`. Sizes `sm|md|lg|icon|iconSm`. Pill shape. Focus ring accent.
- **Input**: pill, 40px height. Search is a larger pill with icon.
- **Card**: default / accent (hero gradient, use sparingly for KPI highlights) / flat.
- **Badge / StatusBadge**: draft neutral, sent accent, paid success, overdue danger.
- **Tabs**: pill list with Motion `layoutId="tab-active"`.
- **Table**: prefer semantic `<table>` with compact rows, muted headers, tabular money. No card-per-row on desktop list pages unless the page already does that.
- **Charts**: Recharts, theme CSS variables for series colors. Keep tooltips quiet.
- **Modal**: overlay `bg-ink/30 backdrop-blur-sm`, surface panel `rounded-3xl`, Escape + backdrop click to dismiss (`ClientFormModal`).
- **Toast**: top-right stack from `UIContext`. Variants success / error / info.
- **Empty / loading**: `EmptyState`, `Skeleton`, or a small Loader2.

## Motion

Subtle, fast, functional. Spring-ish 0.2–0.4s on overlays. Page fade in AppShell is 0.25s. `MotionConfig reducedMotion="user"` is on. Do not add page-load choreography or looping decorative motion in the app shell.

## 21st.dev

Search 21st before hand-rolling a complex control (date range, command combobox beyond the existing palette, data grid). Installed components must be restyled to these tokens. Do not replace working Button/Input/Card/Tabs.
