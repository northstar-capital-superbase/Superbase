# Northstar — Master Architecture

> **This is the single source of truth (SoT)** for the Northstar ecosystem's
> architecture. It supersedes all prior/scattered plans. When any other document
> conflicts with this one, **this document wins** — update it here first, then
> propagate. Each other doc owns a narrow slice (see §7 Documentation Map).
>
> _Last reconciled against `main` after PR #7 (consolidation)._ 

---

## 1. The Northstar Ecosystem

Three layers, one mission: **build enduring, intelligent systems that compound value** — culminating in an autonomous financial operating system.

| Layer | What it is | Owns | Horizon |
|---|---|---|---|
| **Northstar Capital** | Parent organization | Infrastructure, research, capital, products, brand | Decade |
| **Northstar OS** | Production platform — autonomous financial OS | Capital allocation, agent orchestration, portfolio intelligence, workflow automation, financial infrastructure | Long-term / production |
| **Northstar Labs** | R&D environment | Agent architecture, memory systems, MCP integrations, financial intelligence, automation, research & validation | Experimental |

**Promotion pipeline (the governing rule):**

```
idea → Northstar Labs (build + validate + simulate) → promotion gate → Northstar OS (production)
```

Nothing reaches OS — and nothing touches live capital at scale — until it is built and **validated in Labs** (tests + simulation + risk bounds). Labs is the proving ground; OS is the production surface.

**In this repository today:** the codebase hosts both surfaces. `/` is the **Northstar OS** showcase (the command-center front door); `/labs` is the **Northstar Labs** runtime (the multi-agent lab). They share one Next.js app and the `lib/` core.

---

## 2. Current Implemented State (audit of `main`)

A single Next.js 14 app (TypeScript, App Router, Tailwind). `lib/` is framework-agnostic core; `app/api` is a thin HTTP layer; `components/` is the UI.

### Routes (pages)
| Route | Surface | Purpose |
|---|---|---|
| `/` | **OS** | Marketing/command-center showcase (Home / Login / OS dashboard, mock data) |
| `/labs` | **Labs** | Multi-agent dashboard (chat, agent roster, memory, sessions, integrations) |
| `/tour` | Labs | Static guided UI overview |

### APIs (`app/api/*`)
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Run the crew (non-streaming) |
| `/api/chat/stream` | POST | Run the crew, streamed as SSE (`CrewEvent`s) |
| `/api/agents` | GET | Agent roster + runtime (provider/model/memory) + trading config |
| `/api/memory` | GET/DELETE | Shared memory (filter by kind/author/text; clear) |
| `/api/health` | GET | Readiness + `?ping` (LLM) / `?memory` (store) self-tests |
| `/api/trading` | GET/POST | Robinhood MCP proxy: status/probe/list/call (policy-gated) |

All run on the Node runtime; mutating/runtime-reading routes are `force-dynamic` and rate-limited.

### Agents (`lib/agents`)
| Agent | Role | Implementation |
|---|---|---|
| **Orchestrator** | Plan + synthesize | single LLM call (`base-agent`) |
| **Research** | Facts & context | single LLM call |
| **Strategist** | Sequenced plan | single LLM call |
| **Behavioral** | Risk & human factors | single LLM call |
| **Trader** | Portfolio analysis & (gated) execution | **MCP tool loop** (`trading-agent`) |

Orchestration (`lib/orchestration/crew.ts`): orchestrator drafts a plan → specialists run sequentially over shared memory → orchestrator synthesizes. Specialist set is resolved by `lib/agents/specialists.ts` — base = research/strategist/behavioral; **Trader auto-joins when `ROBINHOOD_MCP_TOKEN` is set**. Emits `CrewEvent`s for live UI.

### Core libraries (`lib/`)
| Module | Interface | Implementations |
|---|---|---|
| `llm/` | `LLMProvider` | Anthropic · OpenAI · **mock** (auto-detected; mock = zero-key default) |
| `memory/` | `MemoryStore` | Supabase · in-process (append log, recent-N retrieval) |
| `mcp/` | `IMcpClient` + `trading-policy` | Robinhood hosted MCP client; code-enforced policy (mode + caps + audit) |
| `orchestration/` | — | `streamCrew` / `runCrew` |
| `guardrails.ts` | — | rate limiter + input bounds |

### Integrations / data / infra
- **Robinhood Agentic Trading** (hosted MCP) — gated by `trading-policy` (`TRADING_MODE`, `$`/run caps, audit to memory).
- **Supabase** — `lab_memory` table (`supabase/schema.sql`); RLS enabled, **no policies yet**.
- **GitHub** — repo + CI (typecheck · lint · test · build).
- **Quality**: Vitest suite, Dockerfile (standalone), `vercel.json`, `AGENTS.md`.

### Known gaps (vs the vision) — the work ahead
Flat memory (no semantic/vector retrieval, no structured knowledge, no summarization) · fixed orchestration (no capability-based routing) · single hardcoded MCP server (no registry/ACL) · only Trader has tool-use · no event store / telemetry persistence / scheduler · no Market/Portfolio/Automation/Memory agents · no simulation env · no auth/multi-tenancy.

---

## 3. Official Architecture Going Forward

The target Labs runtime: **specialist agents over a real memory service, coordinated by a routing orchestrator, reaching the world only through a governed MCP gateway, with everything event-sourced and simulatable before promotion to OS.**

### 3.1 Agent roster (canonical)
| Agent | Status | Purpose | Tools / data | Writes |
|---|---|---|---|---|
| **Orchestrator** | exists → upgrade | Decompose & **route dynamically** off capability descriptors; synthesize | registry, memory | plan, synthesis, run record |
| **Memory** | new | Curate long-term knowledge: embed, summarize, serve hybrid retrieval | vector + structured store | facts, summaries, embeddings |
| **Research** | exists → +tools | Gather & synthesize info with citations | web/search MCP, memory | cited facts |
| **Market Intelligence** | new | Monitor markets, generate **signals** (not orders) | market-data MCP, memory | signals |
| **Portfolio Intelligence** | new | Risk/allocation analysis → **recommendations** (no execution) | broker MCP (read-only), signals | analyses, recommendations |
| **Automation** | new | Execute approved workflows; scheduled/triggered ops; **gated execution** | MCP gateway + policy, scheduler | audit/events |

Every agent declares a typed **capability descriptor** (`id`, purpose, inputs, outputs, tools, memory read/write, cost class). The Orchestrator routes off these. The current **Trader** becomes the execution capability invoked by **Automation** under **Portfolio Intelligence** decisions.

### 3.2 Orchestration
Dynamic routing: orchestrator → JSON routing plan (validated; deterministic fallback to the current default order) → specialists run, sharing memory → synthesis. Streaming event contract preserved.

### 3.3 MCP gateway (governance chokepoint)
```
Agent → MCP Gateway → [ACL check] → [ToolPolicy: read/mutating, mode, caps] → Server Registry → {Robinhood, MarketData, Web, …} → audit → Event Store
```
- **Registry** of named servers (config, not code); **per-agent ACLs** (e.g. Portfolio Intelligence = broker read-only; only Automation may place orders); **ToolPolicy** generalizes today's `trading-policy`; **credentials** via env now → vault later; **server-side only**, every call audited.

### 3.4 Data architecture (Postgres / Supabase + pgvector)
| Store | Holds |
|---|---|
| Structured | entities/facts, signals, recommendations, portfolio snapshots |
| Vector (pgvector) | embeddings → hybrid (vector + recency + filter) retrieval |
| Working/blackboard | `lab_memory` (per-session), summarized into structured/vector by the Memory Agent |
| Event log (append-only) | every agent action / tool call / order / block — immutable |
| Run telemetry | per-run tokens/latency/cost/outcome |

**Canonical retrieval contract:** `memory.retrieve({ query, filters, k })` replaces ad-hoc `recent()`. **Comms**: blackboard now → typed event bus later.

---

## 4. Roadmap

| Phase | Theme | Status |
|---|---|---|
| 1 | **Foundation** — one `main`, run/event tables, RLS, capability contract | ✅ consolidation done; tables/RLS pending |
| 2 | **Agent Infrastructure** — dynamic routing, shared ToolRunner, MCP gateway/ACL | next |
| 3 | **Memory Systems** — Memory Agent + pgvector hybrid retrieval + summarization | |
| 4 | **Research Systems** — web/search tools + structured knowledge | |
| 5 | **Portfolio Intelligence** — Market + Portfolio agents (read-only) | |
| 6 | **Broker Integrations** — Robinhood via gateway; market-data source; Automation execution | partial (Robinhood wired) |
| 7 | **Simulation Environment** — paper-trading / backtest = the validation gate | |
| 8 | **Northstar OS Integration** — promotion pipeline, auth/multi-tenancy, durable infra | |

---

## 5. Principles (binding)

**Engineering:** modular · reusable · clear interfaces · documented · observable · maintainable · one source of truth · build foundations before features.
**Agents:** collaborate · share context · explain reasoning · maintain traceability · clear objectives · improve via feedback.
**Security:** secrets server-side · least-privilege per-agent tool ACLs · code-enforced policy (never prompt-only) for money/irreversible actions · audit everything · simulate before live.
**Design language:** precision, intelligence, infrastructure, trust — mission-control aesthetic; clarity over novelty.

---

## 6. Decision framework

Before building, ask: Does it strengthen the ecosystem? Increase capability? Create leverage? Compound over time? Move Northstar toward an autonomous financial OS? If not, defer.

---

## 7. Documentation Map (eliminates duplication)

This SoT is the **only** place for ecosystem definitions, the agent/MCP/data architecture, and the roadmap. Every other doc is a **narrow, non-overlapping slice**:

| Doc | Owns (and ONLY this) |
|---|---|
| **`docs/NORTHSTAR.md`** (this) | Ecosystem, architecture, roadmap, principles — the SoT |
| `README.md` | Quick start + feature overview; links here for architecture |
| `docs/TRADING.md` | Robinhood/MCP trading setup + safety policy details |
| `docs/DEPLOY.md` | Deploy (Vercel/Docker) + env reference |
| `docs/UI-TOUR.md` | Labs UI walkthrough |
| `CONTRIBUTING.md` | Local dev + PR workflow |
| `AGENTS.md` | Agent/CI operational guidance for coding tools |

Removed: `docs/ARCHITECTURE.md` (folded into this SoT — it duplicated structure/flow and had gone stale on routing/trading).

---

## 8. Change control

This document changes **before** code does. Any architectural change: update §2 (state) / §3 (target) / §4 (roadmap) here in the same PR. Keep the Documentation Map (§7) accurate so no second "architecture" or "plan" doc is ever created — extend this one.
