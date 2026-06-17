# Northstar Labs — Multi-Agent AI Operating System

[![CI](https://github.com/northstar-capital-superbase/Superbase/actions/workflows/ci.yml/badge.svg)](https://github.com/northstar-capital-superbase/Superbase/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

A **local-first, experimental multi-agent AI lab**. Hand the orchestrator a
task; it plans, delegates to three specialist agents that collaborate through a
shared memory, and synthesizes their work into one answer — all in a dark,
modern dashboard.

> Runs out of the box with **zero API keys** via a built-in mock provider, so
> the full multi-agent workflow is demonstrable on first `npm run dev`. Add an
> Anthropic or OpenAI key for live model output.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — leave empty for mock mode
npm run dev                  # http://localhost:3000
```

- **`/`** — Northstar OS marketing showcase  
- **`/dashboard`** — Mission control overview  
- **`/labs`** — Multi-agent R&D workspace (crew console)

That's it. Type a task in the Lab Console and watch the crew collaborate.

## The agents

| Agent          | Role                       | Responsibility                                            |
| -------------- | -------------------------- | --------------------------------------------------------- |
| **Orchestrator** | Coordination & synthesis | Plans the workflow, delegates, and synthesizes the answer |
| **Research**     | Facts & context          | Surfaces facts, constraints, prior art, and unknowns      |
| **Strategist**   | Planning & sequencing    | Turns research into a concrete, sequenced plan            |
| **Behavioral**   | Risk & human factors     | Pressure-tests for failure modes, incentives, biases      |
| **Trader**       | Portfolio & execution    | Robinhood Agentic MCP — analysis and (when enabled) orders |

### Workflow (the first working multi-agent loop)

```
user task
   │
   ▼
Orchestrator ── drafts a delegation plan ──▶ shared memory
   │
   ▼ (sequential, each reads prior outputs from shared memory)
Research ──▶ Strategist ──▶ Behavioral ──▶ [Trader if MCP connected] ──▶ shared memory
   │
   ▼
Orchestrator ── synthesizes everything ──▶ final answer + agent trace
```

Every step is written to **shared memory**, so agents build on each other within
a run and runs compound across a session.

## Architecture

Grouped by feature so each folder maps to one concern. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full data-flow walkthrough.

```
app/                       # Next.js App Router
  page.tsx                 # renders the dashboard
  api/
    chat/route.ts          # POST → run the crew (non-streaming)
    chat/stream/route.ts   # POST → run the crew, streamed as SSE
    agents/route.ts        # GET  → agent roster + runtime info
    memory/route.ts        # GET/DELETE → shared memory (filterable)
    health/route.ts        # GET  → readiness + ?ping / ?memory self-tests

components/                # dark dashboard UI, grouped by feature
  dashboard/               # Dashboard shell, Sidebar, Integrations, AgentRoster
  chat/                    # Chat console + agent trace + run metrics
  memory/                  # MemoryPanel (live tail) + MemoryExplorer (search)
  session/                 # SessionSwitcher + useSessions (multi-lab)
  shared.ts                # shared client types, pricing/cost helper

lib/                       # framework-agnostic core
  agents/                  # agent profiles, base agent, registry
  llm/                     # provider abstraction: Anthropic | OpenAI | mock
  memory/                  # shared memory: Supabase | in-process
  orchestration/crew.ts    # the multi-agent workflow (streaming generator)

supabase/schema.sql        # shared-memory table
agents-py/                 # optional CrewAI-native mirror of the agents
Dockerfile · vercel.json   # deploy targets
.github/workflows/ci.yml   # typecheck + build on push/PR
```

### Features

- **Streaming runs** — agents light up live via SSE as each one works
- **Sessions** — multiple named labs, each with isolated, persisted memory
- **Memory Explorer** — search/filter the shared memory by kind, author, text
- **Run metrics** — per-agent latency, token usage, and estimated cost
- **Integration cockpit** — live provider/memory status + one-click diagnostics

**Design principles:** modular (agents are declarative profiles; adding one is a
single entry), provider-agnostic (swap Claude/OpenAI/mock via env), and
local-first (no external service required to run).

## Configuration

All optional — see `.env.example`. The lab auto-detects:

- **LLM provider:** `ANTHROPIC_API_KEY` → Claude, else `OPENAI_API_KEY` → OpenAI,
  else **mock**. Force with `LLM_PROVIDER`.
- **Shared memory:** Supabase if `SUPABASE_URL` + a key
  (`SUPABASE_SERVICE_ROLE_KEY`, preferred) are set — apply `supabase/schema.sql`
  first — otherwise in-process memory. Verify with `/api/health?memory=1`.
- **Robinhood Agentic Trading:** set `ROBINHOOD_MCP_TOKEN` (OAuth bearer from the
  Robinhood MCP connect flow). The **Trader** joins every crew run automatically.
  Verify with `GET /api/trading?probe=1`. Full setup: [`docs/TRADING.md`](docs/TRADING.md).

## Robinhood Agentic — go live

1. **Connect (desktop):** open `/labs` → Integrations → **Connect Robinhood**
   (`GET /api/trading/oauth/start`), or use Cursor → Tools & MCPs with
   `https://agent.robinhood.com/mcp/trading` (see repo `.mcp.json`). Fund your
   **Agentic account** when Robinhood prompts.
2. Locally the token is saved to `.robinhood-mcp-token`; for deploy set
   `ROBINHOOD_MCP_TOKEN` on your host (e.g. Vercel → Environment Variables).
3. Set `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) — the Trader's tool loop needs a
   live model; mock mode cannot drive MCP tools.
4. Start with `TRADING_MODE=advisory`, probe with **Run diagnostics** on `/labs`,
   then move to `auto` when tool names and caps look right.
5. Open `/labs`, run a portfolio task, and confirm the Trader appears in the trace.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Claude / OpenAI ·
CrewAI (optional Python module).

## CrewAI module (optional)

The main lab is TypeScript-native and self-contained. `agents-py/` is a
CrewAI-native counterpart of the same four roles for experimenting with the
CrewAI runtime directly — see `agents-py/README.md`.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```
