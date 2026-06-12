# Northstar Design Audit & Migration Plan

**Date:** 2026-06-10  
**Scope:** Full repository UI inventory across `origin/main` and `origin/cursor/northstar-os-ui-redesign-5717`  
**Constraint:** Platform unification first — no per-page redesigns, no new surface area until tokens and shells converge.

---

## Executive summary

Northstar currently runs **three parallel visual systems** that share similar intent (dark finance OS) but different token sources, class names, and layout shells:

| System | Token source | Primary consumers | Maturity |
|--------|--------------|-------------------|----------|
| **Labs / Platform Tailwind** | `tailwind.config.ts` + `app/globals.css` | `Dashboard`, `Chat`, `Integrations`, memory, sessions | Production default on `main` at `/labs` |
| **Showcase CSS** | `components/showcase/showcase.css` (`--ns-*`) | `NorthstarShowcase`, `HomePage`, `Login`, `OsDashboard` | Marketing at `/` on `main` |
| **OS layer (partial)** | Tailwind + `.os-card` / `.os-page` | `AppShell`, platform routes under `app/(os)/` | PR #11 only; labs internals still on legacy `.panel` |

There are **five dashboard-like surfaces**, **six navigation patterns**, **four card families**, **five button dialects**, and **four layout shells**. The redesign branch (PR #11) added a fourth shell (`AppShell`) without retiring the legacy `Dashboard` + `Sidebar` wrapper, so both coexist.

**Northstar target:** One token layer, one primitive component API, one `AppShell` for all authenticated/platform routes. Marketing (`/`) keeps a distinct *layout* but consumes the same tokens and primitives — not a third button/card implementation.

---

## Methodology

Inventory was built by static analysis of:

- `origin/main` — current production routing (`/` = showcase, `/labs` = legacy dashboard)
- `origin/cursor/northstar-os-ui-redesign-5717` — platform shell + route split (PR #11)
- Local `cursor/dev-environment-setup-5717` — older snapshot where `/` still mounts `Dashboard` directly

Class and token usage was grep’d across `components/**`, `app/**`, and CSS files. No new UI was added for this audit.

---

## 1. Typography systems

### 1.1 Labs / Platform Tailwind (implicit scale)

**Source:** `tailwind.config.ts` + ad-hoc utility classes in components.

| Role | Implementation | Example locations |
|------|----------------|-------------------|
| Body | `text-slate-200`, default sans (Geist vars declared but **not loaded** in `app/layout.tsx`) | `globals.css` `body` |
| Page title | `text-xl` / `text-2xl font-semibold` | `PageHeader` (redesign) |
| Section label | `text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500` | `MetricCard`, `PageHeader` eyebrow |
| Mono metadata | `font-mono text-[9px]`–`text-[11px] uppercase tracking-[0.14em]` | `Sidebar`, `AppShell`, `SessionSwitcher` |
| Micro UI | `text-[11px]`–`text-[13px]` scattered | `Chat`, `Integrations`, `AgentRoster`, memory |
| Agent signal colors | `signal-*` Tailwind keys | `tailwind.config.ts`, `AgentRoster` |

**Issues:**

- No formal type scale; sizes are magic numbers (`text-[10px]`, `text-[12px]`, etc.).
- `--font-geist-sans` / `--font-geist-mono` referenced in Tailwind but root layout does not import `next/font` — falls back to `system-ui` / `ui-monospace`.
- Eyebrow/mono patterns duplicated inline ~40+ times across labs components.

### 1.2 Showcase CSS (`--ns-*`)

**Source:** `components/showcase/showcase.css`

| Token / class | Purpose |
|---------------|---------|
| `--ns-sans` | System stack: Inter, Segoe UI, system-ui |
| `--ns-mono` | SF Mono, JetBrains Mono, Menlo |
| `--ns-text`, `--ns-text-2`, `--ns-text-3` | Primary / secondary / tertiary copy |
| `.ns-eyebrow`, `.ns-mono-tag`, `.ns-mono-idx` | Uppercase mono labels |
| `.ns-hero-title`, `.ns-h2`, `.ns-lede` | Marketing headings (clamp-based) |
| `.ns-d-title`, `.ns-d-bignum` | Mock OS dashboard typography |
| `.ns-auth-title`, `.ns-field span` | Auth form labels |

**Issues:**

- Parallel color tokens (`--ns-accent: #6E8BFF` vs Tailwind `accent: #6d8bff` — 1 hex digit drift).
- Background tokens (`--ns-bg: #06070A`) differ from `base-900: #07080d`.
- Entire type system lives in a scoped `.ns-root` subtree; platform pages never import it.

### 1.3 OS primitives (redesign branch)

**Source:** `components/os/PageHeader.tsx`, `MetricCard.tsx`, `StatusBadge.tsx`, `AgentCard.tsx`

Formalizes a *subset* of the Labs implicit scale:

- Eyebrow: `font-mono text-[10px] uppercase tracking-[0.2em]`
- H1: `text-xl sm:text-2xl font-semibold`
- Description: `text-[13px] text-slate-500`
- Metric value: `font-mono text-2xl`
- Badge: `text-[11px] font-medium`

**Issues:** Only used on new platform pages; labs internals (`Chat`, `Integrations`, `AgentRoster`) ignore these conventions.

### Typography unification target

```
design/tokens/typography.ts  →  Tailwind theme extend (fontSize, letterSpacing)
                              →  CSS variables on :root (alias --ns-* for showcase)
Primitives: Text, Eyebrow, MonoTag, H1, H2, Body, Caption
```

---

## 2. Dashboard implementations

| # | Name | File(s) | Route | Shell | Data |
|---|------|---------|-------|-------|------|
| A | **Legacy Labs Dashboard** | `components/dashboard/Dashboard.tsx` | `/labs` (main), `/` (dev-setup branch) | Fixed `Sidebar` `w-64` | Live API — chat, memory, agents |
| B | **Labs Workspace** | `components/labs/LabsWorkspace.tsx` | `/labs` (redesign) | `AppShell` | Same logic as A, refactored layout |
| C | **Mission Control** | `components/mission/MissionControl.tsx` | `/dashboard` (redesign) | `AppShell` | Live health, agents, memory feed |
| D | **Showcase mock OS** | `components/showcase/OsDashboard.tsx` | Embedded in `NorthstarShowcase` tour states | `.ns-d-*` only | Static / demo data |
| E | **UI Tour** | `app/tour/page.tsx` | `/tour` | None — `max-w-4xl` centered doc | Static copy |

### Overlap analysis

| Concern | A vs B | C vs D |
|---------|--------|--------|
| Purpose | **Duplicate** — same crew console | **Conceptual overlap** — both show system overview |
| Implementation | B wraps legacy child components | C uses live APIs; D is marketing fiction |
| Canonical choice | **B** (under `AppShell`) | **C** for product; **D** stays marketing-only |

### Dashboard migration rule

- **Delete path for A:** `Dashboard.tsx` becomes a thin re-export of `LabsWorkspace` → then removed.
- **Keep D** as showcase fiction but restyle via shared tokens (not `.ns-d-card` duplicates).
- **E** migrates to `AppShell` + shared `PageHeader` when platform unification lands; content-only page.

---

## 3. Navigation systems

| # | System | Location | Pattern | Routes |
|---|--------|----------|---------|--------|
| 1 | **Legacy labs sidebar** | `components/dashboard/Sidebar.tsx` | Fixed left `w-64`, pipeline legend, runtime panel | N/A (in-dashboard only) |
| 2 | **AppShell desktop sidebar** | `components/os/SidebarNav.tsx` | `w-56`, `OS_NAV` from `nav.ts` | Platform routes |
| 3 | **AppShell mobile drawer** | `components/os/AppShell.tsx` | Overlay + slide-in | Same as #2 |
| 4 | **AppShell mobile bottom bar** | `components/os/MobileNav.tsx` | Fixed bottom, 5 primary items | `MOBILE_NAV` subset |
| 5 | **Showcase marketing nav** | `showcase.css` `.ns-nav` + `HomePage.tsx` | Sticky top, scroll blur, mobile drawer | In-page anchors + external links |
| 6 | **Showcase bottom toolbar** | `NorthstarShowcase.tsx` `.ns-rev` | Fixed bottom on mobile for tour states | Showcase state machine |
| 7 | **Command palette** | `components/os/CommandPalette.tsx` | ⌘K modal | Jump to `OS_NAV` hrefs |
| 8 | **Tour standalone** | `app/tour/page.tsx` | No nav — back link only | `/tour` |
| 9 | **OsDashboard tabs** | `OsDashboard.tsx` `.ns-d-tab` | Horizontal tabs inside mock dashboard | Showcase only |

### Navigation migration rule

**Single source of truth:** `components/os/nav.ts` → `OS_NAV`

| Consumer | Action |
|----------|--------|
| `Sidebar.tsx` | **Delete** after labs uses `AppShell` |
| `SidebarNav` / `MobileNav` | **Keep** — canonical |
| Showcase nav | **Keep layout**; link targets must match `OS_NAV` hrefs (`/dashboard`, `/labs`, etc.) |
| `CommandPalette` | **Keep**; register all routes + future deep links |
| `OsDashboard` tabs | **Demote** to showcase-local state; do not add a 10th nav pattern for product |

---

## 4. Card styles

| Family | Definition | Radius | Border / BG | Used by |
|--------|------------|--------|-------------|---------|
| `.panel` | `globals.css` | `rounded-2xl` | `border-white/5 bg-base-800/70 blur` | `Dashboard`, `Integrations`, `Chat` sections |
| `.panel-tight` | `globals.css` | `rounded-xl` | `bg-base-750/60` | Inputs, nested blocks |
| `.os-card` | `globals.css` (redesign) | `rounded-2xl` | `border-white/[0.06] bg-base-800/60` | `MetricCard`, `AgentCard`, platform pages |
| `.ns-card` | `showcase.css` | `16px` | `var(--ns-surface)` + hover lift | Marketing platform grid |
| `.ns-vision-card` | `showcase.css` | grid cell | `var(--ns-bg)` | Vision section |
| `.ns-d-card` | `showcase.css` | `16px` | Mock dashboard cards | `OsDashboard` |
| **Inline agent cards** | `AgentRoster.tsx` | `rounded-xl` | `panel` + dynamic ring color | Labs live roster |
| **`AgentCard` primitive** | `components/os/AgentCard.tsx` | via `.os-card` | Top accent bar + `StatusBadge` | Agents directory, Mission Control |

### Card drift

`.panel` and `.os-card` differ only in opacity/blur — functionally duplicate. `.ns-card` adds hover transform and pseudo-element glow not present elsewhere.

### Card unification target

One `Card` primitive:

```tsx
<Card variant="default | tight | interactive" padding="sm | md | lg" />
```

CSS implementation: single `@layer` class backed by `--ns-surface` tokens. Showcase `.ns-card` becomes a *composition* (`Card` + marketing hover modifier), not a separate token tree.

---

## 5. Button variants

| Dialect | Examples | Locations |
|---------|----------|-----------|
| **Primary accent** | `rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-base-900` | `Chat` Run, `SessionSwitcher` create, `AppShell` Open Labs |
| **Ghost / outline** | `rounded-lg border border-white/5 bg-base-750/60 ... hover:border-accent/40` | `Integrations` diagnostics, memory actions |
| **Pill chip** | `rounded-full border border-white/5 px-3 py-1.5 text-[11px]` | `Chat` suggestions |
| **Showcase primary** | `.ns-btn-primary` — inverted (light bg, dark text) | Marketing CTAs |
| **Showcase ghost** | `.ns-btn-ghost` | Marketing secondary |
| **Showcase large** | `.ns-btn-lg` | Hero CTAs |
| **Filter chip** | `MemoryExplorer` `Chip` — toggle with `border-accent/50 bg-accent/15` | Memory filters |
| **Tab pill** | `ResearchTerminal` — active/inactive tab buttons | Research page |
| **Auth** | `.ns-auth-demo`, `.ns-auth-btn` | `Login.tsx` |
| **Icon ghost** | `rounded-lg border p-2` | Mobile menu, command trigger |

### Button unification target

```tsx
<Button variant="primary | secondary | ghost | danger" size="sm | md | lg" />
```

Map showcase `.ns-btn-*` to the same variants via CSS module or shared class generator. **Rule:** No raw `bg-accent` on `<button>` outside `Button.tsx`.

---

## 6. Layout shells

| Shell | File | Structure | Applies to |
|-------|------|-----------|------------|
| **Root layout** | `app/layout.tsx` | `<html><body>{children}</body>` — no fonts, no providers | Everything |
| **Platform AppShell** | `app/(os)/layout.tsx` → `AppShell` | Sidebar + header + `max-w-7xl` main + mobile nav | redesign routes only |
| **Legacy Dashboard shell** | `Dashboard.tsx` | `flex h-screen overflow-hidden` + `Sidebar` + scroll main | `/labs` on main |
| **Showcase root** | `NorthstarShowcase` `.ns-root` | Full-viewport marketing + state machine | `/` |
| **Auth shell** | `Login.tsx` `.ns-auth` | Centered card over art background | Showcase login state |
| **Tour doc** | `app/tour/page.tsx` | `max-w-4xl mx-auto` | `/tour` |

### Shell gap (redesign branch)

| Route group | Shell today | Should be |
|-------------|---------------|-----------|
| `/`, login | Showcase `.ns-root` | Showcase layout + **shared tokens** |
| `/dashboard`, `/labs`, `/agents`, … | `AppShell` | `AppShell` |
| `/tour` | None | `AppShell` (doc layout) or marketing chrome |
| Labs internals | Mixed `.panel` inside `AppShell` | Primitives inside `AppShell` |

### AppShell unification target

```
app/
  layout.tsx              # fonts, :root CSS variables, providers
  (marketing)/
    layout.tsx            # optional light chrome — NO second design system
    page.tsx              # NorthstarShowcase
  (platform)/
    layout.tsx            # AppShell — ALL authenticated / operational routes
    dashboard/
    labs/
    agents/
    ...
```

---

## 7. Token duplication map

| Concept | Tailwind (`base-*`) | Showcase (`--ns-*`) | Aligned? |
|---------|---------------------|---------------------|----------|
| Page background | `#07080d` | `#06070A` | No |
| Surface | `base-800` `#0f111a` | `--ns-surface` `#0C0E13` | No |
| Accent | `#6d8bff` | `#6E8BFF` | ~Yes |
| Border | `white/5` | `--ns-line` `rgba(255,255,255,.08)` | Close |
| Text primary | `slate-200` | `--ns-text` `#EDEFF4` | Close |
| Good / live | `emerald-*` | `--ns-good` `#7FB39B` | Different hue |
| Sans font | Geist (unwired) | system / Inter | No |
| Mono font | Geist mono (unwired) | SF Mono / JetBrains | No |

**Canonical choice:** Promote Tailwind `base-*` / `accent` / `signal-*` to CSS variables on `:root`, then alias `--ns-*` in `showcase.css` to those variables for backward compatibility during migration.

---

## 8. Component inventory (redesign branch)

### OS primitives (keep & extend)

| Component | Role | Replaces |
|-----------|------|----------|
| `AppShell` | Layout shell | `Dashboard` wrapper, `Sidebar` |
| `SidebarNav` / `MobileNav` | Navigation | `Sidebar.tsx` |
| `CommandPalette` | Quick nav | — |
| `PageHeader` | Page title block | Inline headers |
| `MetricCard` | KPI tile | `.panel` metrics, `.ns-d-card` metrics |
| `AgentCard` | Agent tile | `AgentRoster` cards (labs) |
| `StatusBadge` | Status chip | Inline dots, `.ns-d-chip` |
| `ActivityFeed` / `Timeline` | Lists | Ad-hoc feed markup |
| `Skeleton` | Loading | Ad-hoc pulse divs |

### Legacy (migrate then delete)

| Component | Blocked by |
|-----------|------------|
| `dashboard/Sidebar.tsx` | Labs still imports via `Dashboard` on main |
| `dashboard/Dashboard.tsx` | Route still points here on some branches |
| `dashboard/Integrations.tsx` | Needs `Card` + `Button` primitives |
| `dashboard/AgentRoster.tsx` | Needs `AgentCard` parity (live status ring) |
| `showcase/OsDashboard.tsx` | Showcase coupling — restyle only |

### Thin wrappers (keep)

| Wrapper | Purpose |
|---------|---------|
| `IntegrationsPage` | `PageHeader` + `Integrations` |
| `MemoryWorkspace` | `PageHeader` + memory views |
| `LabsWorkspace` | Crew console composition |

---

## 9. Migration plan — Northstar Design System + unified AppShell

**Principle:** Unify tokens and primitives first; migrate consumers in dependency order; delete duplicates last. No page-by-page visual redesign.

### Phase 0 — Branch & route alignment (prerequisite)

**Goal:** One routing model before token work.

| Step | Action |
|------|--------|
| 0.1 | Merge PR #11 (`cursor/northstar-os-ui-redesign-5717`) to `main` |
| 0.2 | Confirm `/` = showcase, `/labs` = `LabsWorkspace`, `/dashboard` = `MissionControl` |
| 0.3 | Remove dev branch pattern of mounting `Dashboard` at `/` |
| 0.4 | Add redirect: any legacy import of `Dashboard` → `LabsWorkspace` |

**Exit criteria:** All platform routes live under `app/(os)/` with `AppShell`.

---

### Phase 1 — Token layer (single source of truth)

**Goal:** One `:root` variable set feeding Tailwind and showcase.

| Step | Action | Files |
|------|--------|-------|
| 1.1 | Create `design/tokens/colors.css` with `--ns-*` and `--color-base-*` aliases | new |
| 1.2 | Import tokens in `app/globals.css` `@layer base` | `globals.css` |
| 1.3 | Point `tailwind.config.ts` `colors.base` to `var(--color-base-900)` etc. | `tailwind.config.ts` |
| 1.4 | Replace hardcoded values in `showcase.css` with `var(--color-*)` references | `showcase.css` |
| 1.5 | Wire `next/font` Geist in `app/layout.tsx`; set `--font-geist-sans/mono` | `layout.tsx` |
| 1.6 | Add `design/tokens/typography.ts` → Tailwind `fontSize` extension | new |

**Exit criteria:** Visual diff on `/` and `/labs` ≤ subtle rounding; no hex literals added in new code.

---

### Phase 2 — Primitive API (no new pages)

**Goal:** Replace CSS class families with typed components.

| Step | Component | Replaces |
|------|-----------|----------|
| 2.1 | `design/ui/Button.tsx` | inline accent/ghost, `.ns-btn-*` |
| 2.2 | `design/ui/Card.tsx` | `.panel`, `.panel-tight`, `.os-card` |
| 2.3 | `design/ui/Badge.tsx` | `StatusBadge` (move or re-export) |
| 2.4 | `design/ui/Input.tsx` | chat input, memory search, session create |
| 2.5 | `design/ui/Text.tsx` | `PageHeader` typography slots |
| 2.6 | `design/ui/SectionHeader.tsx` | merge `PageHeader` + repeated eyebrow rows |
| 2.7 | Export barrel `design/ui/index.ts` | — |

**Implementation notes:**

- `Card` default styles = today's `.os-card` (the stricter redesign variant wins).
- `Button` primary = labs accent style; showcase inverted primary = `variant="inverse"` for marketing only.
- Keep `clsx` + Tailwind; no new CSS-in-JS library.

**Exit criteria:** Primitives documented in Storybook-style `design/README.md` or inline JSDoc; zero new routes.

---

### Phase 3 — AppShell as the only platform shell

**Goal:** Delete legacy shell code.

| Step | Action |
|------|--------|
| 3.1 | Ensure `app/(platform)/layout.tsx` wraps **all** operational routes including `/tour` |
| 3.2 | Delete `components/dashboard/Sidebar.tsx` |
| 3.3 | Delete `components/dashboard/Dashboard.tsx` after `LabsWorkspace` is sole labs entry |
| 3.4 | Move `OS_NAV` to `design/navigation/nav.ts` (re-export from `components/os/nav.ts` during transition) |
| 3.5 | Add `navigation.ts` helper: `isPlatformRoute(pathname)` for showcase link highlighting |

**Exit criteria:** `grep -r "dashboard/Sidebar" components` returns zero. One sidebar implementation.

---

### Phase 4 — Migrate labs internals (composition only)

**Goal:** Same UX, shared primitives — not a redesign.

| Order | File | Changes |
|-------|------|---------|
| 4.1 | `Integrations.tsx` | `Card` + `Button` + `Badge` |
| 4.2 | `AgentRoster.tsx` | `AgentCard` with live `thinking` ring (port dynamic styles) |
| 4.3 | `Chat.tsx` | `Card`, `Button`, `Input` |
| 4.4 | `MemoryPanel.tsx` / `MemoryExplorer.tsx` | `Button`, `Input`, filter `Badge` |
| 4.5 | `SessionSwitcher.tsx` | `Button`, dropdown `Card` |
| 4.6 | `LabsWorkspace.tsx` | Remove remaining `.panel` strings |

**Exit criteria:** `grep -r "\.panel" components` returns zero (except deprecated CSS alias).

---

### Phase 5 — Showcase token consumption (not layout merge)

**Goal:** Marketing keeps its layout; stops owning colors/type.

| Step | Action |
|------|--------|
| 5.1 | Refactor `showcase.css` to use `:root` variables only |
| 5.2 | Replace `.ns-btn-*` internals with `@apply` from primitive classes or shared utilities |
| 5.3 | `Login.tsx` → `Button`, `Input`, `Card` |
| 5.4 | `OsDashboard.tsx` → `Card`, `Badge`, `MetricCard` for mock tiles (still static data) |
| 5.5 | Delete duplicate `.ns-d-*` color literals where primitives cover them |

**Exit criteria:** `showcase.css` file size reduced; no independent accent/background hex values.

---

### Phase 6 — Deprecation & guardrails

| Step | Action |
|------|--------|
| 6.1 | Remove `.panel`, `.panel-tight`, `.os-card` from `globals.css` (after grep clean) |
| 6.2 | ESLint / grep CI check: ban `bg-accent` and `border-white/5` on raw buttons outside `design/ui` |
| 6.3 | Add `docs/DESIGN_SYSTEM.md` — variant matrix, do/don't |
| 6.4 | Update `docs/UI-TOUR.md` to reference `AppShell` nav names |

---

## 10. Suggested directory structure (target)

```
design/
  tokens/
    colors.css
    typography.ts
  ui/
    Button.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    Text.tsx
    SectionHeader.tsx
    index.ts
  navigation/
    nav.ts
components/
  os/
    AppShell.tsx          # shell only — imports design/ui + design/navigation
    SidebarNav.tsx
    MobileNav.tsx
    CommandPalette.tsx
    MetricCard.tsx        # thin domain wrapper over Card
    AgentCard.tsx
    ActivityFeed.tsx
    ...
```

---

## 11. What not to do

| Anti-pattern | Why |
|--------------|-----|
| Redesign each platform page individually | Perpetuates three systems; violates "unify platform first" |
| Copy homepage `.ns-*` layout into `/labs` | PR #11 explicit constraint |
| Add new routes or dashboards | Expands surface before convergence |
| Keep both `Dashboard` and `LabsWorkspace` | Two shells, two test matrices |
| Create a fourth card class (e.g. `.ns-platform-card`) | Use `Card variant=` |

---

## 12. Acceptance criteria (program complete)

- [ ] Single `:root` token file drives Tailwind + showcase
- [ ] Geist fonts loaded in root layout
- [ ] `Button`, `Card`, `Badge`, `Input`, `SectionHeader` cover ≥95% of interactive UI
- [ ] All platform routes use `AppShell`; `Sidebar.tsx` and `Dashboard.tsx` deleted
- [ ] `.panel`, `.os-card`, `.ns-card` removed or aliased to `Card`
- [ ] `OS_NAV` is the only product navigation config
- [ ] Showcase at `/` uses shared tokens; layout remains marketing-specific
- [ ] `/labs` functional parity with pre-migration (chat, memory, sessions, integrations)
- [ ] CI grep/lint blocks new inline button/card drift

---

## 13. PR sequencing recommendation

| Order | PR | Content |
|-------|-----|---------|
| 1 | Merge #11 | Route split + `AppShell` (already built) |
| 2 | `design/tokens` | Phase 1 only — no visual intent change |
| 3 | `design/ui-primitives` | Phase 2 — add components, no consumer migration |
| 4 | `design/shell-cleanup` | Phase 3 — delete legacy shell |
| 5 | `design/labs-migrate` | Phase 4 — labs components |
| 6 | `design/showcase-tokens` | Phase 5 — showcase CSS slimdown |
| 7 | `design/guardrails` | Phase 6 — lint + docs |

Each PR should be independently deployable with no user-facing regressions on `/labs`.

---

## Appendix A — File reference (current `main`)

```
app/globals.css              .panel, .panel-tight
app/layout.tsx               minimal shell
app/page.tsx                 NorthstarShowcase
app/labs/page.tsx            Dashboard
app/tour/page.tsx            standalone doc
components/dashboard/        Dashboard, Sidebar, Integrations, AgentRoster
components/chat/Chat.tsx
components/memory/*
components/session/*
components/showcase/           showcase.css, NorthstarShowcase, OsDashboard, Login
tailwind.config.ts           base, accent, signal colors
```

## Appendix B — Additional files (PR #11 / redesign branch)

```
app/(os)/layout.tsx          AppShell
app/(os)/*/page.tsx          platform routes
components/os/*              shell + primitives
components/labs/LabsWorkspace.tsx
components/mission/MissionControl.tsx
components/*/IntegrationsPage, MemoryWorkspace, AgentsDirectory, etc.
app/globals.css              + .os-card, .os-page
```

---

*This document is the canonical audit. Implementation should follow phases 0→6 in order without adding new UI surfaces.*
