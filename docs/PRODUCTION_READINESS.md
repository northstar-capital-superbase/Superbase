# Northstar Labs — Production-Readiness Assessment & Roadmap

> Status: **Polished prototype → not yet production-ready.** This document is a
> renovation plan, not a rewrite. The existing repository, Supabase project,
> Vercel deployment, environment configuration, and integrations stay in place;
> every recommendation below is an incremental refactor, removal, or
> restructuring *within the current repo*.
>
> _Last assessed: 2026-06-16 · Branch: `claude/production-platform-setup-yvlt7c`_

---

## 1. Executive summary

Northstar Labs is a **Next.js 14 (App Router) multi-agent AI operating system**.
An Orchestrator plans a task, delegates to specialist agents (Research,
Strategist, Behavioral, and a Robinhood-connected Trader) that collaborate
through a shared memory store, and synthesizes a final answer — streamed live to
a dashboard over SSE. The integrations are real: Anthropic and OpenAI for
inference, Supabase for shared memory, and Robinhood (over MCP, with PKCE OAuth)
for trading.

The codebase is **well-architected and clean** — clear layering, swappable
provider/memory abstractions, trading safety enforced in code rather than in
prompts, and server-only secrets. What it is **not** yet is a production product.
It behaves like a showcase: a marketing/finance-OS site backed by hardcoded mock
data, a **demo login that accepts any credentials**, and runtime that **silently
falls back to a mock LLM and in-process memory** when environment variables are
absent. There is no real user authentication on the API surface, Supabase Row
Level Security is enabled but has **no policies**, observability is effectively a
single `console.warn`, and tests cover core logic only (no route, integration,
or end-to-end coverage).

**Headline recommendation:** treat the next 30 days as a renovation in four
themes — (1) harden the architecture so production never silently runs in mock
mode, (2) make data + persistence real and RLS-protected, (3) add real
authentication/authorization and a multi-instance-safe rate limiter, and
(4) add observability, a real testing pyramid, and deployment automation. None of
this requires a new repo or a re-architecture; it is additive and surgical on top
of the existing structure.

---

## 2. Architecture assessment

### Layers (as they exist today — keep this shape)

```
components/            # React UI (dashboard + showcase)
  dashboard/  chat/  memory/  session/   # the real lab UI
  showcase/                              # marketing/demo finance-OS site
app/
  page.tsx                               # dashboard entry
  api/{chat,chat/stream,agents,memory,health,trading,trading/oauth}/route.ts
lib/                   # framework-agnostic core
  agents/      # profiles, base agent, trading agent, registry, specialists
  llm/         # provider abstraction: anthropic | openai | mock
  memory/      # store abstraction: supabase | in-process
  mcp/         # Robinhood MCP client, oauth, token, trading-policy
  orchestration/crew.ts                  # streamCrew()/runCrew() workflow
  guardrails.ts                          # rate limit + task validation
supabase/schema.sql    # lab_memory table
```

### Data flow

```
client → POST /api/chat[/stream]
       → runCrew()/streamCrew()
       → Orchestrator (plan) → Research → Strategist → Behavioral → [Trader if MCP]
                                   ↑ each reads recent shared memory ↓
       → shared memory (Supabase or in-process)
       → Orchestrator synthesizes → final answer + agent trace (SSE events)
```

### Strengths to preserve
- **Provider abstraction** (`lib/llm/*`) — Anthropic / OpenAI / mock behind one interface.
- **Memory-store abstraction** (`lib/memory/*`) — Supabase / in-process behind one interface.
- **Policy-in-code** — `lib/mcp/trading-policy.ts` enforces order caps and mutating-tool gates in code, not just in the prompt; checked at both the agent loop and the `/api/trading` proxy.
- **Server-only secrets** — API keys and tokens never reach the browser.
- **Graceful degradation** — runs with zero keys for local dev.

### Weaknesses (the renovation targets)
- **Mock-by-default is a production foot-gun.** `lib/llm/index.ts:14-39` defaults to the mock provider and `lib/memory/index.ts:25-36` defaults to in-process memory when env vars are missing — a misconfigured production deploy will *look* healthy while serving fake output and losing all memory on restart.
- **Client-side pricing table.** `components/shared.ts:84-102` hardcodes model pricing; it silently drifts from real costs.
- **Duplicated policy touchpoints.** Trading policy is invoked in both `lib/agents/trading-agent.ts` and `app/api/trading/route.ts`; correct today, but easy to update one and forget the other.
- **No per-agent resilience.** `streamCrew()` has no retry or circuit-breaker; one failed LLM call fails the whole run.
- **State is process-local.** Both the in-memory store and the rate limiter live in process — neither survives a restart or works across replicas.

---

## 3. Critical issues

| # | Issue | Evidence | Impact | Production-grade replacement |
|---|-------|----------|--------|------------------------------|
| C1 | **No auth on API routes** | `/api/chat`, `/api/chat/stream`, `/api/memory`, `/api/agents` accept any caller | Anyone with the URL can run agents (burning API spend) and read/clear another session's memory | Add Supabase Auth + a Next.js `middleware.ts` gate; scope memory by authenticated user/session |
| C2 | **Supabase RLS has no policies** | `supabase/schema.sql:22` enables RLS but defines zero policies | If the anon key is ever used client-side, the `lab_memory` table is fully open | Add explicit per-user RLS policies; convert schema into versioned migrations |
| C3 | **Demo login accepts any credentials** | `components/showcase/Login.tsx:86-111` ("DEMO · ANY CREDENTIALS WORK") | Misleading as a real auth surface; unsafe if shipped as-is | Replace with real Supabase Auth sign-in, or clearly fence the showcase behind a `DEMO` flag |
| C4 | **Silent mock/in-process defaults in prod** | `lib/llm/index.ts:14-39`, `lib/memory/index.ts:25-36` | A misconfigured prod deploy serves fake AI output and volatile memory with no error | Fail-fast env validation: when `NODE_ENV=production`, refuse to boot on mock provider / in-memory store unless explicitly opted in |
| C5 | **Dependency CVEs** | `npm audit`: Next.js 14.2.35 (multiple), postcss, glob, form-data | Known DoS/XSS/cache-poisoning exposure | Upgrade Next.js and transitive deps; gate via `npm audit` in CI |
| C6 | **No observability** | sole signal is `console.warn` in `lib/agents/trading-agent.ts:149`; metrics live only in memory | Production incidents are invisible; no error tracking, tracing, or metrics export | Add Sentry, structured logging, and metrics export (latency/tokens/cost); persist the trading audit trail |
| C7 | **In-process rate limiter** | `lib/guardrails.ts:14-50` | On multi-instance deploys the real limit is N×20/min; lost on restart | Back the limiter with a shared store (Supabase/Redis/Upstash) |

---

## 4. Quick wins (high value, low effort)

- **Fail-fast config module.** Add `lib/config/` with a zod env schema that throws on boot in production if the provider is `mock` or memory is in-process (addresses C4).
- **`npm audit` + CodeQL in CI.** Add a security job to `.github/workflows/ci.yml` (addresses C5).
- **Coverage gate.** Turn on Vitest coverage and set a floor so coverage can't regress.
- **CORS / origin allowlist** on the API routes (no cross-origin by default).
- **Sentry init.** `@sentry/nextjs` + `captureException` in route/crew error paths (first slice of C6).
- **`SECURITY.md`** documenting secret handling, the trading caps, and responsible disclosure.
- **Gate the showcase.** Put `components/showcase/*` behind a `NEXT_PUBLIC_DEMO` flag (or move under `app/(marketing)/`) so demo data and the any-credentials login can't be mistaken for product.
- **Persist the trading audit log** to a durable table instead of `console.warn`.

---

## 5. 30-day roadmap

Mapped to the eight priorities: stable architecture, real data integrations,
auth/authz, error handling & observability, testing, CI/CD, docs, UX polish.

### Week 1 — Stable architecture & hardening *(priorities 1)*
- Add `lib/config/` env-validation module; fail-fast on mock/in-process in production (C4).
- Upgrade Next.js + resolve `npm audit` CVEs (C5); add the security CI job.
- Centralize constants (model names, tool names, trading modes); de-duplicate the policy touchpoints.
- Add CORS/origin allowlist and `SECURITY.md`.

### Week 2 — Real data integrations *(priority 2)*
- Convert `supabase/schema.sql` into `supabase/migrations/` and **make Supabase persistence required** in production.
- Author and test **RLS policies** for `lab_memory` (C2).
- Replace the client-side pricing table with a server-sourced rate (kill silent drift).
- Add a Supabase-store integration test.

### Week 3 — Auth/authz & scale *(priorities 3)*
- Add **Supabase Auth** + `middleware.ts`; protect `/api/chat`, `/api/memory`, `/api/agents` (C1).
- Replace the demo login with real sign-in, or fence it behind the demo flag (C3).
- Move the rate limiter to a **shared store** (C7); scope memory + limits per authenticated user.

### Week 4 — Observability, testing, CI/CD, docs, UX *(priorities 4-8)*
- **Observability (4):** Sentry + structured logging + metrics export; persist trading audit; add per-agent retry/circuit-breaker.
- **Testing (5):** add route/integration/E2E tests (Playwright) on top of the unit suite; coverage gate.
- **CI/CD (6):** add deploy automation (Vercel preview + production) and a migration step.
- **Docs (7):** API reference, production runbook (quota/OOM/throttling recovery), update README to separate "lab" from "showcase."
- **UX polish (8):** real auth states, error toasts/empty states, loading/skeletons, accessibility pass on the dashboard.

---

## 6. Production readiness checklist

**Security**
- [ ] API routes require authentication (C1)
- [ ] Supabase RLS policies defined and tested (C2)
- [ ] Demo "any-credentials" login removed or flag-gated (C3)
- [ ] `npm audit` clean; CodeQL enabled (C5)
- [ ] CORS / origin allowlist on API routes
- [ ] `SECURITY.md` + secret-rotation guidance

**Data & persistence**
- [ ] Supabase required (no silent in-memory fallback) in production (C4)
- [ ] Schema managed via versioned migrations
- [ ] Server-sourced pricing (no hardcoded client table)

**Auth & authz**
- [ ] Supabase Auth + `middleware.ts` gate
- [ ] Memory + rate limits scoped per user

**Observability**
- [ ] Sentry error tracking (C6)
- [ ] Structured logging
- [ ] Metrics export (latency / tokens / cost)
- [ ] Durable trading audit log
- [ ] Per-agent retry / circuit-breaker

**Testing**
- [x] Unit tests for core logic (crew, guardrails, trading policy, mcp)
- [ ] HTTP route / integration tests
- [ ] Supabase-store tests
- [ ] Component / E2E tests
- [ ] Coverage gate in CI

**CI/CD**
- [x] typecheck → lint → test → build on push/PR
- [ ] Security scan job (audit/CodeQL)
- [ ] Deploy automation (preview + prod)
- [ ] Migration step in pipeline

**Docs**
- [x] Architecture, deploy, trading docs
- [ ] API reference
- [ ] Production runbook
- [ ] README clearly separates lab vs showcase

**UX**
- [ ] Real auth states
- [ ] Error / empty / loading states
- [ ] Accessibility pass

---

## 7. Recommended repository structure (renovation, not rewrite)

Keep `lib/`, `app/`, and `components/` exactly where they are. The changes below
are additive or relocations — annotated as renovation steps, not a new layout.

```
lib/
  agents/            # unchanged
  llm/               # unchanged (provider abstraction kept)
  memory/            # unchanged (store abstraction kept)
  mcp/               # unchanged
  orchestration/     # unchanged
  guardrails.ts      # ~ refactor: back rate limiter with shared store (C7)
  config/            # + NEW: zod env schema, fail-fast prod validation (C4)
  auth/              # + NEW: Supabase Auth helpers, session/user utilities (C1)
  observability/     # + NEW: logger, Sentry init, metrics export (C6)
  constants.ts       # + NEW: model/tool/mode constants (de-dup policy touchpoints)

app/
  middleware.ts      # + NEW: auth gate for /api/* and protected pages (C1)
  (marketing)/       # ~ relocate components/showcase here, behind DEMO flag (C3)
  api/               # unchanged routes; add authn + CORS allowlist

components/
  dashboard/ chat/ memory/ session/   # unchanged (the real lab UI)
  showcase/          # ~ move under app/(marketing)/ or flag-gate (C3)

supabase/
  migrations/        # ~ convert schema.sql into versioned migrations + RLS policies (C2)

tests/
  unit/              # ~ existing suites move here
  integration/       # + NEW: route + Supabase-store tests
  e2e/               # + NEW: Playwright flows

docs/
  ARCHITECTURE.md DEPLOY.md TRADING.md UI-TOUR.md   # unchanged
  PRODUCTION_READINESS.md                            # this document
  API.md             # + NEW: endpoint reference
  RUNBOOK.md         # + NEW: incident/recovery runbook
SECURITY.md          # + NEW
```

Legend: `unchanged` = keep as-is · `+ NEW` = add · `~` = refactor/relocate.

---

_This assessment is the source of truth for the production-hardening issues filed
against this repository. Each critical item (C1–C7) and roadmap milestone maps to
a tracked GitHub issue._
