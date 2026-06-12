# Northstar Design System & Unified OS Migration Plan

**Date:** 2026-06-10  
**Scope:** Entire Northstar product across all active branches  
**Constraint:** Unify the platform — **no per-page redesigns**, no new demo surfaces, no parallel dashboard paradigms.

**Brand anchor:** Homepage (`NorthstarShowcase` + `showcase.css`) is the visual source of truth.  
**Product shell:** All authenticated/operational routes inherit the same tokens, typography, navigation, and components — with functional layout variation per product area only.

---

## Executive summary

Northstar today is **one product with four competing UI stacks** spread across branches:

| Stack | Where it lives | Problem |
|-------|----------------|---------|
| **Showcase CSS** (`--ns-*`) | `/` homepage, Login, mock OsDashboard | Correct brand — isolated in `.ns-root` |
| **Labs Tailwind** (`base-*`, `.panel`) | Chat, memory, Integrations, legacy Dashboard | Dev-dashboard aesthetic |
| **OS primitives** (`components/os/*`, `.os-card`) | PR #11 platform routes only | Partial second system on Tailwind |
| **Labs terminal CSS** (`ops-*`, `labs.css`) | PR #13 Labs + Settings | Third layout + third nav |

A user moving Home → Labs → Dashboard → Agents does **not** feel inside one OS. They feel like they switched between a marketing site, an internal tool, and experimental UIs.

**Northstar goal:** ONE design system, ONE AppShell, ONE navigation config. Homepage stays visually distinct in *layout* (marketing scroll, art, narrative) but shares the same **tokens and components** as the product.

---

## 1. Current inconsistencies

### 1.1 Design systems (4 parallel)

| System | Token source | Card primitive | Button primitive | Consumers |
|--------|--------------|----------------|------------------|-----------|
| **A — Showcase** | `showcase.css` `:root` `--ns-*` | `.ns-card`, `.ns-d-card`, `.ns-vision-card` | `.ns-btn-primary`, `.ns-btn-ghost`, `.ns-btn-lg` | `/`, Login, OsDashboard (marketing mock) |
| **B — Labs Tailwind** | `tailwind.config.ts` `base-*`, `accent`, `signal-*` | `.panel`, `.panel-tight` | Inline `bg-accent`, `border-white/5` | Chat, memory, Integrations, AgentRoster, SessionSwitcher, legacy Sidebar |
| **C — OS layer** | Tailwind + `.os-card`, `.os-page` | `MetricCard`, `AgentCard` → `.os-card` | Inline + `PageHeader` actions | PR #11: MissionControl, LabsWorkspace, AgentsDirectory, etc. |
| **D — Labs terminal** | Re-imports `--ns-*` + custom `ops-*` | `.ops-panel` | `.ops-directive`, Tailwind overrides | PR #13: LabsOperatingCore, IntelligenceStack |

**Drift examples:**

| Token | Showcase | Tailwind `base-*` |
|-------|----------|-------------------|
| Page bg | `#06070A` | `#07080d` |
| Surface | `#0C0E13` | `#0f111a` |
| Accent | `#6E8BFF` | `#6d8bff` |
| Border | `rgba(255,255,255,.08)` | `border-white/5` |

---

### 1.2 Font systems (3 parallel)

| Source | Sans | Mono | Loaded? |
|--------|------|------|---------|
| **Showcase** | `--ns-sans` (system, Inter) | `--ns-mono` (SF Mono, JetBrains) | Yes, via `.ns-root` |
| **Tailwind** | `var(--font-geist-sans)` | `var(--font-geist-mono)` | **No** — `app/layout.tsx` never imports `next/font` |
| **Ad-hoc** | `text-slate-*`, default body | `font-mono text-[9px]`–`text-[11px]` | Fallback system-ui |

**Typography scale fragmentation:**

| Role | Showcase | OS `PageHeader` | Labs terminal | Legacy labs |
|------|----------|-----------------|---------------|-------------|
| Eyebrow | `.ns-eyebrow` 11px / 0.18em | `text-[10px]` / 0.2em | `.ops-kpi-label` 9px | `text-[10px]` / 0.16em |
| H1 | `.ns-hero-title` clamp 36–76px | `text-xl sm:text-2xl` | `.ops-title` clamp 26–34px | `text-lg` |
| Body | `.ns-lede` 15–18px | `text-[13px]` | `.ops-subtitle` 14px | `text-[12px]` |
| Mono meta | `.ns-mono-tag` | — | `.ops-pill` 9px | `text-[11px]` |

No shared type scale file exists.

---

### 1.3 Navigation systems (7+)

| # | Implementation | Branch | Routes |
|---|----------------|--------|--------|
| 1 | Showcase sticky nav + mobile drawer | main | In-page anchors on `/` |
| 2 | Showcase bottom toolbar `.ns-rev` | main | Showcase state machine |
| 3 | Legacy labs `Sidebar.tsx` | main | In-dashboard only |
| 4 | `LabsNav.tsx` top bar | PR #13 | Labs, Settings |
| 5 | `AppShell` + `SidebarNav` + `MobileNav` | PR #11 | Platform `(os)/*` |
| 6 | `CommandPalette` ⌘K | PR #11 | Jump nav |
| 7 | `OsDashboard` `.ns-d-tab` horizontal tabs | main | Marketing mock only |
| 8 | `/tour` standalone | main | No product nav |

**Link target drift:** Showcase links to `/labs`; PR #11 adds `/dashboard`, `/agents`, `/trading`; PR #13 adds `/settings`. No single `OS_NAV` is wired everywhere.

---

### 1.4 Spacing scales (4 parallel)

| System | Page padding | Section gap | Card padding | Max width |
|--------|--------------|-------------|--------------|-----------|
| Showcase | `28px` (`.ns-container`) | `118px` sections | `28–34px` cards | `1180px` |
| AppShell | `px-4 py-5 sm:px-6` | `gap-6` page modules | `p-4` MetricCard | `max-w-7xl` (1280px) |
| Labs terminal | `20px` | `12px` grid | `12–14px` panels | Full bleed |
| Legacy labs | `p-4` | `gap-4` | `p-3`–`p-4` | Sidebar `w-64` + fluid |

No shared spacing token (`--ns-space-*` or Tailwind spacing extension).

---

### 1.5 Card styles (6 families)

| Class / component | Radius | Surface | Hover |
|-------------------|--------|---------|-------|
| `.panel` | `rounded-2xl` | `base-800/70` + blur | None |
| `.panel-tight` | `rounded-xl` | `base-750/60` | None |
| `.os-card` | `rounded-2xl` | `base-800/60` | transition-colors |
| `.ns-card` | `16px` | `--ns-surface` | lift + glow pseudo |
| `.ns-d-card` | `16px` | `--ns-surface` | None (dashboard mock) |
| `.ops-panel` | `12px` | `--ns-surface` | None |
| `AgentRoster` inline | `panel` + ring | dynamic agent color | thinking ring |

---

### 1.6 Button styles (5+ dialects)

| Dialect | Example | Used by |
|---------|---------|---------|
| Showcase primary | `.ns-btn-primary` inverted light | Homepage CTAs |
| Showcase ghost | `.ns-btn-ghost` | Homepage secondary |
| Labs accent | `bg-accent text-base-900 rounded-lg` | Chat Run, SessionSwitcher |
| Labs outline | `border-white/5 bg-base-750/60` | Integrations, memory |
| OS/AppShell | `bg-accent` compact header CTA | AppShell "Open Labs" |
| Terminal | `.ops-directive`, Execute button overrides | PR #13 Chat |
| Pill chip | `rounded-full border-white/5` | Chat samples, filters |

---

### 1.7 Dashboard / layout paradigms (6 — must become 1)

| Paradigm | File / route | Shell | Branch |
|----------|--------------|-------|--------|
| **Marketing homepage** | `NorthstarShowcase` `/` | `.ns-root` full-page marketing | main |
| **Mock OS dashboard** | `OsDashboard` embedded in showcase | `.ns-d-*` top tabs | main |
| **Legacy labs dashboard** | `Dashboard.tsx` `/labs` | Fixed sidebar `w-64` | main |
| **Mission Control** | `MissionControl.tsx` `/dashboard` | AppShell | PR #11 |
| **Labs workspace** | `LabsWorkspace.tsx` `/labs` | AppShell | PR #11 |
| **Labs terminal** | `LabsOperatingCore.tsx` `/labs` | Custom `labs-root` + LabsNav | PR #13 |
| **UI tour doc** | `app/tour/page.tsx` | None | main |

**This is the core product failure:** three different answers to "what is the Labs/dashboard experience?"

---

### 1.8 Route map across branches

| Route | main | PR #11 (OS redesign) | PR #13 (labs outcome) |
|-------|------|----------------------|------------------------|
| `/` | Showcase | Showcase | Showcase |
| `/labs` | Legacy Dashboard | LabsWorkspace + AppShell | LabsOperatingCore + LabsNav |
| `/dashboard` | — | MissionControl + AppShell | — |
| `/agents` | — | AgentsDirectory + AppShell | — |
| `/settings` | — | SettingsPanel + AppShell | SettingsPage + LabsNav |
| `/integrations` | — | IntegrationsPage + AppShell | — (in Settings Developer) |

---

## 2. Recommended design language

**Name:** Northstar OS Design Language (NDL)  
**Anchor:** Homepage visual identity — not homepage *layout* copied everywhere.

### Principles

1. **One token layer** — Homepage `--ns-*` values become canonical; Tailwind maps to them.
2. **One shell** — AppShell for all product routes; homepage exempt (marketing layout).
3. **Functional identity per area** — Labs feels operational; Dashboard feels overview; Agents feels roster — same chrome, different content modules.
4. **90% production / 10% experimental** — Experimental badge only on Labs/R&D features, not on the whole UI.
5. **Outcomes over infrastructure** — Provider names, GitHub, diagnostics never on primary surfaces.

### Visual character (from homepage)

| Attribute | Specification |
|-----------|---------------|
| Mood | Premium autonomous finance OS — calm, precise, confident |
| Density | Product pages: medium-high (terminal-adjacent); marketing: airy |
| Color | Near-black bases, cool accent `#6E8BFF`, warm flow `#E2B17C`, good `#7FB39B` |
| Motion | Subtle `ns-viewin` entrance; live pulse on active agents only |
| Radius | `9px` buttons, `12–16px` cards, `18px` hero panels |
| Borders | `rgba(255,255,255,0.08)` — never harsh white/5 vs /6 drift |

### What to stop doing

- Creating page-specific CSS files (`labs.css`, `settings.css`, `ops-*`)
- Building new nav components per page (`LabsNav`, `Sidebar`, showcase tabs)
- Adding dashboard layouts per feature (terminal grid vs AppShell vs sidebar)
- Importing `showcase.css` only inside one page — tokens belong in global `:root`

---

## 3. Shared AppShell architecture

### Target route structure

```
app/
  layout.tsx                    # Fonts, global NDL tokens, providers
  page.tsx                      # Marketing — NorthstarShowcase (no AppShell)

  (platform)/
    layout.tsx                  # <AppShell>{children}</AppShell>
    dashboard/page.tsx          # Mission overview
    labs/page.tsx               # Operational intelligence
    agents/page.tsx
    research/page.tsx
    trading/page.tsx
    memory/page.tsx
    settings/page.tsx           # General + Developer (collapsed diagnostics)
    integrations/page.tsx       # Optional: merge into Settings → Developer
```

### AppShell responsibilities (single implementation)

| Concern | Owner |
|---------|-------|
| Brand mark + product name | AppShell header |
| Primary navigation | `SidebarNav` ← `OS_NAV` |
| Mobile drawer + bottom bar | `MobileNav` ← `MOBILE_NAV` |
| Command palette ⌘K | `CommandPalette` |
| Workspace context slot | Page-level (e.g. session switcher on Labs only) |
| Content max-width + padding | Shell main: `max-w-[var(--ns-max)]` or `max-w-7xl` aligned to 1180px |
| Page transition | `animate-fadeUp` / `ns-view` — one motion token |

### AppShell must NOT

- Duplicate homepage marketing nav
- Embed Integrations/runtime panels
- Use a different sidebar width or color system per page
- Wrap `/` homepage

### Canonical source

Merge **PR #11 `components/os/AppShell.tsx`** as base, then:

1. Restyle with NDL tokens (not `base-*` hardcoded)
2. Wire nav labels/icons to match homepage link language
3. Delete `LabsNav`, `Sidebar.tsx`, showcase `.ns-d-nav` for product routes

---

## 4. Typography system

### Canonical fonts

```css
/* design/tokens/typography.css — sourced from showcase.css */
--ns-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
--ns-mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
```

Optional: load **Geist** via `next/font` only if brand formally adopts it; until then homepage stack wins.

### Type scale (NDL)

| Token | Size | Weight | Tracking | Use |
|-------|------|--------|----------|-----|
| `display` | clamp(36px, 5vw, 56px) | 600 | -0.035em | Marketing hero only |
| `h1` | clamp(24px, 2.8vw, 32px) | 600 | -0.03em | Page titles inside AppShell |
| `h2` | clamp(20px, 2.2vw, 26px) | 600 | -0.02em | Section titles |
| `h3` | 16px | 600 | -0.01em | Panel titles |
| `body` | 15px | 400 | -0.01em | Descriptions |
| `body-sm` | 13px | 400 | 0 | Secondary copy |
| `mono-label` | 11px | 500 | 0.14em uppercase | Eyebrows, KPI labels |
| `mono-meta` | 10px | 400 | 0.12em uppercase | Timestamps, status |
| `data-lg` | 28px | 600 | -0.03em | KPI values, portfolio stats |

### React primitives

```
<Text variant="display|h1|h2|h3|body|body-sm" />
<Eyebrow>{children}</Eyebrow>
<MonoLabel>{children}</MonoLabel>
```

**Rule:** Ban new `text-[10px]` / `text-[11px]` outside `design/ui/`.

---

## 5. Navigation system

### Single config: `design/navigation/os-nav.ts`

```ts
export const OS_NAV = [
  { href: "/", label: "Home", icon: "home", shell: false },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", mobilePrimary: true },
  { href: "/labs", label: "Labs", icon: "labs", mobilePrimary: true },
  { href: "/agents", label: "Agents", icon: "agents" },
  { href: "/research", label: "Research", icon: "research" },
  { href: "/trading", label: "Trading", icon: "trading", mobilePrimary: true },
  { href: "/memory", label: "Memory", icon: "memory" },
  { href: "/settings", label: "Settings", icon: "settings", mobilePrimary: true },
];
```

**Integrations** → Settings → Developer tab (not top-level nav) unless power-user flag.

### Navigation components (only these)

| Component | Role |
|-----------|------|
| `MarketingNav` | Homepage only — sticky, scroll blur, from showcase |
| `AppSidebar` | Desktop product nav |
| `AppMobileNav` | Drawer + bottom bar |
| `CommandPalette` | Quick jump + future deep links |

### Consistency rules

- Same active state styling everywhere (accent underline or left rail — pick one)
- Homepage product links must match `OS_NAV` hrefs exactly
- Remove showcase bottom `SHOWCASE` toolbar from production builds (dev preview only)

---

## 6. Component system

### Directory structure

```
design/
  tokens/
    colors.css          # --ns-* canonical (from showcase.css)
    typography.css
    spacing.css
    motion.css
  ui/
    Button.tsx          # primary | secondary | ghost | inverse (marketing)
    Card.tsx            # default | tight | interactive
    Badge.tsx           # ok | warn | live | idle | error
    Input.tsx
    Textarea.tsx
    Eyebrow.tsx
    SectionHeader.tsx   # replaces PageHeader + ad-hoc headers
    KPI.tsx
    Timeline.tsx
    ActivityFeed.tsx
    AgentStatusCard.tsx # single agent card — replaces AgentRoster, AgentCard, AliveAgentGrid, ops-agent-row
    Skeleton.tsx
  shell/
    AppShell.tsx
    AppSidebar.tsx
    AppMobileNav.tsx
    CommandPalette.tsx
  navigation/
    os-nav.ts
```

### Card → one primitive

| Deprecated | Maps to |
|------------|---------|
| `.panel`, `.panel-tight` | `<Card variant="default|tight">` |
| `.os-card` | `<Card variant="default">` |
| `.ns-card` | `<Card variant="interactive">` (marketing hover) |
| `.ops-panel` | `<Card>` + layout class |

### Button → one primitive

| Deprecated | Maps to |
|------------|---------|
| `.ns-btn-primary` | `<Button variant="primary">` or `inverse` on dark marketing |
| `.ns-btn-ghost` | `<Button variant="ghost">` |
| `bg-accent rounded-lg` | `<Button variant="accent">` (product primary) |

### Domain modules (compose primitives — no new design dialect)

| Module | Used on | Composes |
|--------|---------|----------|
| `MissionOverview` | Dashboard | KPI, ActivityFeed, AgentStatusCard |
| `LabsConsole` | Labs | SectionHeader, Chat, Timeline, IntelligencePanel |
| `AgentsDirectory` | Agents | AgentStatusCard grid |
| `MemoryWorkspace` | Memory | Timeline, ActivityFeed |
| `TradingConsole` | Trading | KPI, Card, Badge |
| `DeveloperPanel` | Settings | Card, Button — diagnostics collapsed |

---

## 7. Migration roadmap

**Rule:** Phases change **platform layers** only. Pages swap imports; no visual redesign passes.

### Phase 0 — Freeze & merge strategy (week 0)

| Action | Detail |
|--------|--------|
| Stop | New page-specific CSS, new nav components, new dashboard layouts |
| Choose base branch | `main` + cherry-pick **one** platform route split (PR #11), not PR #13 terminal |
| Close/revert | PR #13 `labs.css` / `LabsNav` / `ops-*` — extract *content priorities* only, not layout |

### Phase 1 — Token unification

| Step | Work |
|------|------|
| 1.1 | Extract `showcase.css` `:root` → `design/tokens/colors.css` imported in `app/globals.css` |
| 1.2 | Point `tailwind.config.ts` colors to `var(--ns-*)` aliases |
| 1.3 | Add `spacing.css`, `typography.css`, `motion.css` |
| 1.4 | Slim `showcase.css` to layout/marketing-only classes; tokens removed |
| 1.5 | Delete duplicate hex in `globals.css` gradients (align to `--ns-accent`) |

**Exit:** Visual parity on `/`; no new hex in components.

### Phase 2 — Primitive library

| Step | Work |
|------|------|
| 2.1 | Ship `Button`, `Card`, `Badge`, `Text`, `Eyebrow`, `SectionHeader`, `KPI` |
| 2.2 | Ship `AgentStatusCard`, `Timeline`, `ActivityFeed` |
| 2.3 | Document in `design/README.md` |

**Exit:** Storybook or MDX optional; zero new routes.

### Phase 3 — AppShell consolidation

| Step | Work |
|------|------|
| 3.1 | `app/(platform)/layout.tsx` wraps all routes in one `AppShell` |
| 3.2 | Restyle AppShell with NDL tokens |
| 3.3 | Delete `Sidebar.tsx`, `LabsNav.tsx`, duplicate settings layout |
| 3.4 | Homepage keeps `MarketingNav`; links use `OS_NAV` |

**Exit:** One sidebar, one mobile nav, one command palette.

### Phase 4 — Page migration (import swap only)

| Order | Page | Action |
|-------|------|--------|
| 4.1 | Settings | `DeveloperPanel` uses primitives; tabs use `SectionHeader` |
| 4.2 | Integrations | Move under Settings; remove `/integrations` route or redirect |
| 4.3 | Dashboard | `MissionControl` → primitives; remove health provider tiles from surface |
| 4.4 | Labs | Single `LabsConsole` module inside AppShell — **not** terminal CSS |
| 4.5 | Agents, Memory, Research, Trading | Replace `.os-card` / `.panel` imports |
| 4.6 | Chat, memory, session | Primitive swap |

**Exit:** `grep -r "labs.css\|ops-\|\.panel\|LabsNav" components` → 0.

### Phase 5 — Marketing alignment

| Step | Work |
|------|------|
| 5.1 | Homepage uses `<Button>`, `<Card>` for platform grid |
| 5.2 | `OsDashboard` mock uses same cards as product Dashboard (static data) |
| 5.3 | Remove showcase-only dashboard paradigm as separate CSS |

### Phase 6 — Guardrails

| Step | Work |
|------|------|
| 6.1 | ESLint: ban raw `bg-accent`, `border-white/5`, `text-[Npx]` outside `design/` |
| 6.2 | CI grep for `.panel`, `.os-card`, new `*-nav.tsx` |
| 6.3 | Deprecate `components/os/*` → move to `design/shell` + `design/ui` |

### PR sequencing

| # | PR | Content |
|---|-----|---------|
| 1 | `ndl/tokens` | Phase 1 |
| 2 | `ndl/primitives` | Phase 2 |
| 3 | `ndl/appshell` | Phase 3 — merge PR #11 shell, delete duplicates |
| 4 | `ndl/migrate-platform` | Phase 4 — page import swaps |
| 5 | `ndl/marketing` | Phase 5 |
| 6 | `ndl/guardrails` | Phase 6 |

**Do not merge PR #13 layout as-is.** Salvage operational *content hierarchy* (timeline, insights rail) as modules inside unified AppShell.

---

## 8. What each major page should feel like

*Mock descriptions — functional identity within one OS.*

### Homepage (`/`)

**Feels like:** The front door to Northstar OS — cinematic, confident, minimal copy. Premium finance brand film, not a product login.  
**User thinks:** "This is a serious autonomous finance operating system."  
**Layout:** Full-bleed marketing scroll; sticky nav; platform vision cards.  
**Not:** Labs UI, sidebars, diagnostics, or agent grids.

---

### Dashboard (`/dashboard`)

**Feels like:** Opening the OS home screen — morning briefing. Capital posture, crew status, what ran overnight, what needs attention.  
**User thinks:** "What is happening across my system right now?"  
**Layout:** AppShell + KPI row + activity feed + agent summary strip. One glance, no scrolling for core status.  
**Not:** Integrations tiles, LLM provider names, GitHub status, or marketing hero.

---

### Labs (`/labs`)

**Feels like:** The operational intelligence floor — where directives become research, workflows, and synthesis. Bloomberg density with Linear clarity.  
**User thinks:** "What are my agents doing, what intelligence exists, what should I execute next?"  
**Layout:** AppShell + page header with workspace switcher + two-column work surface (timeline + command on left, insights/actions on right) + compact agent rail.  
**Not:** Developer showcase, component gallery, empty playground, or isolated terminal nav.

---

### Agents (`/agents`)

**Feels like:** Crew roster and capabilities — who works for you, what each owns, who is active.  
**User thinks:** "Who is on my team and what can they do?"  
**Layout:** AppShell + agent cards with live status when crew runs (shared state from Labs).  
**Not:** Static bios without status or a different card style than Dashboard/Labs.

---

### Research (`/research`)

**Feels like:** Intelligence terminal — generated reports, facts, plans accumulating over time.  
**User thinks:** "What has been researched and what conclusions exist?"  
**Layout:** AppShell + filterable insight feed + detail drawer.  
**Not:** Raw memory dump or chat transcript.

---

### Trading (`/trading`)

**Feels like:** Execution desk — portfolio posture, positions context, policy-bound actions.  
**User thinks:** "What is my exposure and what can the system execute?"  
**Layout:** AppShell + portfolio KPIs + action history + policy summary (outcomes, not MCP endpoint strings).  
**Not:** Robinhood MCP diagnostics on the main surface.

---

### Memory (`/memory`)

**Feels like:** Institutional knowledge — timeline of what the system knows, searchable, exportable.  
**User thinks:** "What does Northstar remember?"  
**Layout:** AppShell + timeline + explorer (existing MemoryExplorer logic, NDL styling).  
**Not:** Debug log aesthetic or implementation backend names.

---

### Integrations (→ Settings → Developer)

**Feels like:** Engine room — for operators only, behind an intentional gate.  
**User thinks:** "Is everything connected?" (only when they choose to look).  
**Layout:** Collapsed behind Settings → Developer → expandable diagnostics.  
**Not:** Top-level nav item or Labs dashboard tile.

---

### Settings (`/settings`)

**Feels like:** System preferences — calm, sparse, trustworthy.  
**User thinks:** "Configure how Northstar behaves."  
**Layout:** AppShell + tabs (General | Developer). Developer holds runtime + diagnostics.  
**Not:** A second app with its own nav (`LabsNav`) or hero marketing block.

---

## Acceptance criteria — "One Northstar OS"

- [ ] Single `:root` token file; homepage and product render identical colors/type
- [ ] One `AppShell` on all platform routes
- [ ] One `OS_NAV` config drives sidebar, mobile, command palette, homepage links
- [ ] One `Card`, one `Button`, one `Badge`, one `AgentStatusCard`
- [ ] No `.panel`, `.os-card`, `.ops-panel`, page-specific `*.css` in `components/`
- [ ] No duplicate dashboard paradigms (legacy Dashboard, terminal Labs, Mission Control as separate UX systems)
- [ ] User can traverse Home → Dashboard → Labs → Agents → Trading without visual regime change
- [ ] Infrastructure details only in Settings → Developer (expandable)

---

## Appendix — files to delete or merge (after migration)

| Delete | Replace with |
|--------|--------------|
| `components/dashboard/Sidebar.tsx` | AppShell |
| `components/labs/LabsNav.tsx` | AppShell |
| `components/labs/labs.css` | NDL tokens + layout utilities |
| `components/settings/settings.css` | NDL tokens |
| `components/labs/AliveAgentGrid.tsx` etc. | `AgentStatusCard` + page modules |
| `globals.css` `.panel` | `Card` primitive |
| PR #11 `.os-card` | `Card` primitive |

| Keep (refactor) | Role |
|-----------------|------|
| `components/showcase/showcase.css` | Marketing layout only |
| `components/os/AppShell.tsx` | Move → `design/shell/`, restyle |
| `components/os/nav.ts` | Move → `design/navigation/os-nav.ts` |
| `components/chat/Chat.tsx` | Domain logic; style via primitives |

---

*This document is the canonical Northstar Design System plan. Implementation proceeds by platform phases — not by redesigning individual pages.*
