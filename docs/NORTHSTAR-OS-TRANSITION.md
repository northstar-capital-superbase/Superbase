# Northstar OS — Transition Plan: Finance-First → Personal AI Operating System

> **Status:** Plan / Proposal (v1.0) — no product code changed by this document.
> **Scope:** Repo-grounded audit of `main` + PR #40, a safe development-time login
> bypass, a reframed Command Center, the first real vertical slice, and a
> small-PR implementation sequence.
> **One sentence:** Northstar is a personal AI operating system for managing
> life, money, work, and connected tools — its edge is turning personal context
> into a calm daily operating plan.

This plan supersedes the finance-only positioning in
[`docs/NORTHSTAR-OS-VISION.md`](./NORTHSTAR-OS-VISION.md). That document remains
an excellent design/interaction reference (the loop, calm-by-default, trust-is-UI,
memory-as-moat, the decision grammar). We keep its **principles and visual system**
and broaden its **subject** from "every financial decision" to "life, money, work,
and connected tools." Finance becomes one module, not the identity.

---

## 0. TL;DR for the owner

- **Keep** the architecture: agent registry, streaming crew, shared memory + RLS,
  OS shell/sidebar, settings, connections, runtime-status probe, the honest
  empty-state discipline. It is genuinely good and broadly reusable.
- **Reframe** the naming and framing that hard-code "finance": brand subtitle,
  Command Center copy, `PortfolioSnapshot`, `TradingSummary`, agent names.
- **Defer** login for development via a **server-authoritative, production-hardened
  bypass** (env-gated, refuses to run in Vercel production, shows a persistent
  banner). RLS and Supabase Auth code stay intact and re-enablable.
- **Redesign** the Command Center around eight life-first zones: Today, Needs
  attention, Upcoming, Money, Inbox, Projects & system health, Agent activity,
  Ask Northstar.
- **Ship one vertical slice first:** "Payday + bills + Gmail + calendar briefing."
- **Sequence** the work as ~10 small, independently reviewable PRs.
- **Owner input required** on ~7 decisions flagged inline as `NEEDS OWNER INPUT`.

---

## 1. Repo-grounded audit

Single Next.js 14 App-Router app (`package.json` → `northstar-labs`), TypeScript,
Tailwind, framer-motion, Supabase SSR, Anthropic/OpenAI SDKs, Vitest. No Docker
for dev. Structure verified from the working tree.

### 1.1 What exists on `main`

**Routing & shell**
- `app/labs/page.tsx` renders `components/dashboard/Dashboard.tsx` — the current
  Command Center. `app/labs/layout.tsx` wraps it in `components/os/OsShell.tsx`
  (sidebar rail + content + `RuntimeStatusProvider`).
- `components/os/OsSidebar.tsx` is the real navigation (the older `OsNav.tsx` with
  only Lab/Settings is effectively dead — see §2). Its `SECTIONS` array is
  **finance-first**: Command Center, Portfolio (soon), Markets (soon), Research
  (soon), Agents (soon), Memory (soon), Workflows (soon), Agent Builder/Sandbox
  (soon), Connections, Security (soon), Settings. Brand subtitle is hardcoded
  `"AI Operating System for Finance"`. Footer shows a `TradingSummary` /
  Robinhood portfolio block.
- Other live routes: `/settings` (`app/settings`), `/connections`
  (`app/connections`), `/labs/console` (Lab Console chat), `/login`, `/` (marketing
  showcase), `app/auth/callback`.

**Auth & RLS (PR #39, merged)**
- `middleware.ts` protects `/labs`, `/settings`, `/connections`; redirects
  unauthenticated visitors to `/login`. **Fails closed**: if Supabase env is
  absent, `updateSession` returns `user: null` (`lib/supabase/middleware.ts` +
  `lib/supabase/env.ts`), so protected routes are *unreachable* — this is exactly
  what blocks development today.
- `lib/auth/getUser.ts` (`getAuthedUser`) is the single server identity source;
  API routes (`app/api/chat/route.ts` etc.) 401 without a session.
- `supabase/schema.sql`: `lab_memory` and `profiles` tables, full per-user RLS
  (`auth.uid() = user_id`), auto-provision trigger, backfill. Solid foundation.
- `providers/AuthProvider.tsx` + `hooks/useAuth.ts`: client session, profile
  (`display_name`), sign-in/up/out, per-user localStorage isolation.

**Agents & orchestration**
- `lib/agents/profiles.ts`: Orchestrator, Research, Strategist, Behavioral, Trader
  — declarative profiles with colors/prompts. `lib/agents/index.ts` registry;
  adding an agent is one profile + one registry line.
- `lib/orchestration/crew.ts`: `streamCrew` (Orchestrator plans → specialists run
  in sequence over shared memory → Orchestrator synthesizes), emitting `CrewEvent`s.
  Non-finance by design — general task solver.
- `lib/memory/*`: `MemoryStore` interface, Supabase store (RLS-scoped via caller
  JWT) + in-memory fallback, cached on `globalThis`.
- `lib/mcp/*`: Robinhood MCP client, OAuth, trading policy/caps; `tradingAllowedFor`
  gates Trader to owner emails only.
- `lib/llm/*`: provider abstraction (Anthropic/OpenAI) with graceful
  "not configured" behavior.

**Design system**
- `docs/NORTHSTAR-OS-VISION.md` + `app/globals.css` tokens (`--ns-*`), calm/rationed
  color, mono-for-data typography, `prefers-reduced-motion` throughout. Reusable
  as-is for a life OS.

### 1.2 What PR #40 (`cursor/command-center-2-0-f299`) adds

Draft "Command Center 2.0". Diff vs `main`: 19 files, +1643/-81. It rebuilds
`components/dashboard/Dashboard.tsx` into a **vertical brief** and adds pure,
tested derivation modules under `lib/dashboard/`:

- `briefing.ts` — `CommandCenterSignals` + `buildBriefing` + `buildPendingItems`.
  Honest, real-signal-only copy. **But finance-coupled**: signals are
  `tradingEnabled`, pending items are "connect a brokerage", copy says
  "connect your first brokerage".
- `recommendations.ts` — `Recommendation` contract + confidence + `topRecommendations`
  (cap 3). Engine-less today; renders honest empty state. **Domain-neutral — keep.**
- `activity.ts` — `ActivityEvent` union with future kinds (`agent_run`,
  `memory_update`, `portfolio_analysis`, `workflow`, `research`, `auth`) + real
  source from Lab Console history + `relativeTime`. **Mostly neutral — keep,
  broaden kinds** (add `bill`, `email`, `calendar`, `deploy`, `db`).
- `crew.ts` — pure crew-status labels. **Neutral — keep.**
- Components: `DailyBriefing`, `Recommendations`, `RecentActivity`,
  `PortfolioSnapshot` (finance), `PendingItems`, `CrewStatus`, `CcSection`,
  `AgentRoster` tweaks, `labs.css`.
- Tests: `tests/{briefing,activity,dashboard-crew,recommendations}.test.ts` — good
  pattern; these guard the pure derivations and should be extended, not discarded.

**Verdict on PR #40:** the *shape* is right (briefing → recommendations → activity
→ status → continue) and the pure-derivation-with-tests pattern is exactly how to
build this. The *framing* is still finance-first (Portfolio snapshot as a primary
card, brokerage as the headline pending item, "portfolio" recommendations). The
transition reframes PR #40 rather than replacing it.

### 1.3 Honest gaps (nothing fabricated — good)

The repo already refuses to invent data (see `TradingSummary` "never shows
placeholder balances", `buildBriefing` honest copy). That discipline is the
product's spine and must carry into every new module. Today there is **no** real
data source for bills, email, calendar, projects, or dev-tool health — so the
first slice must wire *at least one real source per claim* or render an explicit
empty/preview state.

---

## 2. Keep / Rename / Reframe / Remove / Defer

| Area | Verdict | Action |
| --- | --- | --- |
| Agent registry + `streamCrew` + shared memory | **Keep** | Domain-neutral engine; reuse verbatim. |
| Supabase Auth + RLS + `schema.sql` + `getAuthedUser` | **Keep** | Preserve; gate with dev bypass (§3), re-enable later. |
| `OsShell` / `RuntimeStatusProvider` / settings / connections | **Keep** | Reusable OS chrome. |
| `lib/dashboard/recommendations.ts`, `activity.ts`, `crew.ts` | **Keep** | Neutral contracts; broaden `activity` kinds. |
| Honest empty/unavailable-state discipline | **Keep** | Extend to every new module. |
| Brand subtitle `"AI Operating System for Finance"` (`OsSidebar.tsx`) | **Rename** | → `"Personal AI Operating System"`. |
| Agent names Strategist/Behavioral/Trader (`profiles.ts`) | **Reframe** | Map to Chief of Staff + Money/Inbox/Schedule/Developer/Research/Memory agents (§5). Keep declarative registry. |
| `lib/dashboard/briefing.ts` signals + pending items | **Reframe** | Generalize `CommandCenterSignals` beyond `tradingEnabled`; make "connect a brokerage" one of many connection prompts. |
| `PortfolioSnapshot` / `TradingSummary` footer | **Reframe** | Demote from primary hero to the **Money** module card; sidebar footer shows system status, not a portfolio. |
| Sidebar `SECTIONS` (finance-first, many "soon") | **Reframe** | Replace with life-first spine (§4): Command Center, Today, Money, Inbox, Calendar, Projects, Files, Memory, Connections, Activity, Labs. Keep the inert "soon" pattern for unbuilt routes. |
| `components/os/OsNav.tsx` (Lab/Settings only, unused by shell) | **Remove** | Confirm no importers, then delete. Non-destructive. |
| Robinhood/Trader live trading | **Defer** | Keep code + owner-only gate; not part of the first slice. |
| Password reset / SMTP / account creation polish | **Defer** | Already flagged off (`NEXT_PUBLIC_PASSWORD_RESET_ENABLED=false`); leave. |
| `agents-py/`, `Dockerfile` | **Keep (untouched)** | Out of main path; don't invest now. |
| Marketing showcase at `/` | **Keep** | Re-point copy to the broader promise in a later PR. |

`NEEDS OWNER INPUT #1`: Confirm the agent renaming (Strategist→? etc.). Option A:
rename profiles to Money/Inbox/Schedule/Developer/Research/Memory + Chief of Staff.
Option B: keep internal ids, add life-facing display names + remits. Recommendation:
**Option B** first (low-risk, no orchestration change), full rename later.

---

## 3. Safe development-time login bypass

**Goal:** local dev and preview deployments open directly into Northstar, without
deleting Auth/RLS, without a fake login screen or synthetic accounts, and hard to
ship as production.

### 3.1 Why it's blocked today

`middleware.ts` + `lib/supabase/middleware.ts` fail closed: no Supabase session ⇒
`user: null` ⇒ every `/labs|/settings|/connections` request 302s to `/login`.
`getAuthedUser()` returns `null` ⇒ API routes 401. So even with no auth configured,
you cannot reach the OS. This is correct for production and wrong for the current
build phase.

### 3.2 Recommended design — a single "dev operator" bypass

Introduce **one** server-authoritative concept: a fixed local **dev operator**
identity, activated only by an explicit env flag, that leaves all real auth code
paths intact but *unused* while active.

1. **New helper `lib/auth/devMode.ts`** — the *only* place the bypass is decided:
   - `isAuthBypassEnabled()` returns true **iff** `NORTHSTAR_DEV_NO_AUTH === "1"`
     **and** `process.env.VERCEL_ENV !== "production"`. The production guard is
     non-negotiable and lives here so it cannot be forgotten per-call.
   - Export a constant `DEV_OPERATOR` = `{ id: "00000000-0000-0000-0000-000000000000",
     email: "dev@northstar.local", accessToken: null }`.
   - Add a loud `console.warn("[northstar] AUTH BYPASS ACTIVE — do not deploy to production")`
     on first evaluation.
2. **`middleware.ts`** — early-return `NextResponse.next()` (skip the redirect) when
   `isAuthBypassEnabled()`. Real logic below stays byte-for-byte the same.
3. **`getAuthedUser()`** — when `isAuthBypassEnabled()` and no real session, return
   the `DEV_OPERATOR` (id + email, `accessToken: null`). Real resolution path
   unchanged when the flag is off.
4. **Memory under bypass** — because `DEV_OPERATOR.accessToken` is null,
   `getMemory()` (`lib/memory/index.ts`) already falls back to the in-process store
   for that run. This **avoids writing un-RLS'd rows to Supabase** and keeps the
   RLS contract honest: bypassed sessions never touch per-user Postgres data.
   (`NEEDS OWNER INPUT #2`: acceptable that dev-mode memory is ephemeral/in-process?
   Alternative: a dev-only Supabase service-role path, but that weakens the RLS
   guarantee — not recommended.)
5. **Client awareness** — expose a build-time mirror `NEXT_PUBLIC_DEV_NO_AUTH` so
   `AuthProvider`/sidebar can render a **persistent, unmissable banner**
   ("DEVELOPMENT — authentication bypassed") and skip the signed-out UI. The
   server flag (`NORTHSTAR_DEV_NO_AUTH`) remains the source of truth for actual
   access; the public mirror is presentation-only.
6. **Trading stays disabled under bypass** — `tradingAllowedFor("dev@northstar.local")`
   is false unless the owner explicitly lists that email, so no accidental live
   trades. Keep it that way.

### 3.3 Guardrails against shipping it

- Hard refuse when `VERCEL_ENV === "production"` (in `isAuthBypassEnabled`).
- Persistent in-app banner whenever active.
- `.env.example`: document both flags with a blunt warning; keep default unset.
- README/AGENTS.md: a dedicated "Development auth bypass (temporary)" section.
- Optional CI check: fail the build if `NORTHSTAR_DEV_NO_AUTH` is set in a
  production-targeted environment (`NEEDS OWNER INPUT #3`: add this CI guard?).

### 3.4 Preview deployments

Set `NORTHSTAR_DEV_NO_AUTH=1` + `NEXT_PUBLIC_DEV_NO_AUTH=1` on Vercel **Preview**
scope only. Because Preview reports `VERCEL_ENV=preview` (not `production`), the
bypass activates for previews and is impossible to activate on Production even if
the var leaks there. `NEEDS OWNER INPUT #4`: confirm previews should open directly
in (recommended during this phase).

---

## 4. Command Center information hierarchy (reframed)

Life-first, calm, and honest. Preserves the vision doc's "briefing that ends in
actions" and decision grammar. Eight zones, top to bottom:

```
┌ COMMAND CENTER ────────────────────────────────────────────────────────────┐
│  Good <time>, <name>.                                    NORTHSTAR OS · <t>  │
│  <one honest sentence: what's true now, what needs you, is anything wrong>   │  1 TODAY
│                                                                              │     (briefing)
│  ◆ NEEDS ATTENTION (n)                                        Resolve all →  │  2 NEEDS
│    · <bill due before payday · email needing reply · failing deploy · …>     │     ATTENTION
│      each: what · why it matters · source · [Review] / [Approve] [Why?]      │     (ranked)
│                                                                              │
│  ▤ UPCOMING                                                                  │  3 UPCOMING
│    <next calendar commitments + scheduled money events (payday, autopay)>    │
│                                                                              │
│  ┌ MONEY ──────────────┐ ┌ INBOX ───────────────┐                           │  4 MONEY
│  │ cash / bills-due /  │ │ unread / needs-reply /│                           │  5 INBOX
│  │ next payday runway  │ │ triaged — real or     │                           │
│  │ — real or "connect" │ │ "connect Gmail"       │                           │
│  └─────────────────────┘ └───────────────────────┘                           │
│                                                                              │
│  ┌ PROJECTS & SYSTEM HEALTH ───────────────────────────────────────────┐    │  6 PROJECTS &
│  │ tasks/projects · GitHub · Supabase · Vercel — status or "connect"    │    │     SYSTEM HEALTH
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ⟁ AGENT ACTIVITY (live)                                                     │  7 AGENT
│    <what the crew did/learned — from real crew runs + memory diffs>          │     ACTIVITY
│                                                                              │
│  ⌕ Ask Northstar…                                                      ⌘K    │  8 ASK
└──────────────────────────────────────────────────────────────────────────────┘
```

Mapping to existing code: zone 1 = reframed `DailyBriefing`/`buildBriefing`;
zone 2 = `Recommendations` contract renamed conceptually to "Needs attention"
(same `confidence`/`reviewHref` shape); zone 3 = new `UpcomingList`; zone 4 =
reframed `PortfolioSnapshot` → `MoneyCard`; zone 5 = new `InboxCard`; zone 6 =
new `SystemHealthCard`; zone 7 = existing `RecentActivity`/`CrewStatus` broadened;
zone 8 = existing Lab Console CTA → inline ask.

Every card renders exactly one of: **real data**, **empty** ("nothing due"),
**not connected** ("Connect Gmail →"), or **preview** (clearly labeled). No card
ever shows a fabricated number.

---

## 5. Agent system mapping

Keep the declarative registry and streaming crew. Reframe roles to the proposed
Chief-of-Staff model without changing orchestration mechanics initially:

| Proposed agent | Backed by today | First-slice job |
| --- | --- | --- |
| Northstar Orchestrator / Chief of Staff | `ORCHESTRATOR` | Assemble the daily brief; rank "needs attention". |
| Money Agent | `STRATEGIST` (+ Trader deferred) | Bills-vs-payday runway; flag due-before-payday. |
| Inbox Agent | `RESEARCH` remit reuse | Gmail triage: which emails need replies. |
| Schedule Agent | new profile (registry) | Calendar: upcoming commitments, conflicts. |
| Developer Agent | new profile (registry) | GitHub/Supabase/Vercel health summarization. |
| Research Agent | `RESEARCH` | General fact-finding (unchanged). |
| Memory Agent | `BEHAVIORAL` remit reuse | Curate/inspect user-owned memory. |

Adding Schedule/Developer agents is one profile + one registry line each
(`lib/agents/profiles.ts`, `index.ts`) — no engine change.

---

## 6. First vertical slice — "Payday + bills + Gmail + calendar briefing"

The smallest end-to-end thing that proves the promise ("turn personal context into
a calm daily operating plan") with **real, honest data**.

**User story:** *Open Northstar → within seconds see: my next payday, which bills
are due before it, which emails need a reply, and my next few commitments — each
real or clearly "not connected yet".*

**Data sources & honesty**
- **Payday & bills:** `NEEDS OWNER INPUT #5` on the source. Options, cheapest-first:
  (a) user-declared config (payday cadence + recurring bills entered once, stored
  in a new RLS'd `finance_events` table) — no third party, fully honest, ships
  fastest; (b) bank aggregation (Plaid) — larger scope, deferred. **Recommend (a)
  for the slice.**
- **Gmail:** Google OAuth (read-only `gmail.readonly`) via a new Connection.
  `NEEDS OWNER INPUT #6`: approve adding Google OAuth now. Until connected, the
  Inbox card shows "Connect Gmail →".
- **Calendar:** Google Calendar (read-only) — same OAuth grant as Gmail.
- **Briefing:** the Chief-of-Staff agent composes one honest sentence + ranked
  "needs attention" list from whatever sources are actually connected.

**Definition of done**
- New RLS'd tables + Connections entries as needed; each with empty/preview states.
- Command Center Today/Needs-attention/Upcoming/Money/Inbox zones populated from
  real connected data or explicit "connect" prompts.
- Pure derivations (bills-before-payday, needs-reply heuristic) unit-tested in the
  `lib/dashboard/*.test.ts` style.
- Works under the dev auth bypass (in-process/declared data) and with real auth.

---

## 7. Implementation sequence (small, reviewable PRs)

Each PR is independently shippable, keeps CI green (`typecheck → lint → test →
build`), and lands behind honest empty states so nothing half-built looks real.

1. **PR-A · This plan** (docs only). ← current PR.
2. **PR-B · Dev auth bypass** (`lib/auth/devMode.ts`, middleware early-return,
   `getAuthedUser` dev operator, banner, `.env.example` + README/AGENTS.md,
   optional CI guard). Unblocks all further UI work. No product logic touched when
   the flag is off.
3. **PR-C · Reframe naming & shell** (brand subtitle, sidebar `SECTIONS` → life
   spine with inert "soon" rows, remove dead `OsNav.tsx`, generalize
   `CommandCenterSignals` in `briefing.ts`). Reframes PR #40 rather than replacing.
4. **PR-D · Command Center layout v2** (integrate PR #40's brief shape into the
   eight zones; `MoneyCard`/`InboxCard`/`UpcomingList`/`SystemHealthCard` as
   empty/preview-only cards; broaden `activity.ts` kinds + tests).
5. **PR-E · Declared finance events** (RLS'd `finance_events` table + schema.sql +
   settings UI to declare payday cadence & recurring bills + pure
   bills-before-payday derivation + tests). Money card goes real.
6. **PR-F · Google OAuth connection** (read-only Gmail + Calendar scopes, token
   storage design, Connections entry). Foundation only; no UI consumption yet.
7. **PR-G · Inbox + Calendar cards** (consume PR-F: needs-reply heuristic, upcoming
   commitments; honest empty/connect states + tests).
8. **PR-H · Chief-of-Staff briefing** (Orchestrator composes the one-sentence brief
   + ranked "needs attention" from connected sources; Schedule/Developer agent
   profiles registered).
9. **PR-I · System health card** (GitHub/Supabase/Vercel status via existing
   runtime-probe pattern; read-only summaries, "connect" otherwise).
10. **PR-J · Marketing `/` + docs refresh** (re-point the public promise; update
    README/AGENTS.md to the life-OS framing; note auth is deferred).

`NEEDS OWNER INPUT #7`: PR ordering preference — is it acceptable to land the dev
bypass (PR-B) before the reframe, so previews open directly during the rest of the
work? (Recommended.)

---

## 8. Owner-input checklist (consolidated)

1. Agent renaming approach — display names now, internal rename later? (§2)
2. Dev-mode memory ephemeral/in-process acceptable? (§3.2)
3. Add a CI guard that fails production builds with the bypass flag set? (§3.3)
4. Confirm previews open directly (bypass on Preview scope only)? (§3.4)
5. Payday/bills source for the slice — declared config (recommended) vs Plaid? (§6)
6. Approve adding Google OAuth (read-only Gmail + Calendar) now? (§6)
7. Land dev bypass (PR-B) before the reframe? (§7)

---

## 9. Solo-founder realism

- Every PR above is scoped to one subsystem and one reviewer pass; none require a
  big-bang migration. The engine (agents/crew/memory/RLS) is untouched by most of
  them.
- The dev bypass removes the single biggest day-to-day friction (login) while
  keeping the production security posture intact and re-enablable by flipping one
  env var.
- The "real, empty, unavailable, or preview" rule means partial connectivity is a
  first-class state, so the product is always demoable and honest even mid-build.
- Finance work (Plaid, live trading) is explicitly deferred, shrinking the slice to
  what one person can ship with AI coding agents: declared finance events + one
  Google OAuth grant + reframed UI.
