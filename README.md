# Northstar Labs — Multi-Agent AI Operating System

[![CI](https://github.com/northstar-capital-superbase/Superbase/actions/workflows/ci.yml/badge.svg)](https://github.com/northstar-capital-superbase/Superbase/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

A **multi-user, multi-agent AI lab** with real accounts. Sign in, hand the
orchestrator a task; it plans, delegates to three specialist agents that
collaborate through memory scoped to you alone, and synthesizes their work
into one answer — all in a dark, modern dashboard.

> Requires **Supabase Auth**: set `NEXT_PUBLIC_SUPABASE_URL` +
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` and apply `supabase/schema.sql`. Also
> requires an LLM key: set **`ANTHROPIC_API_KEY`** (preferred) or
> **`OPENAI_API_KEY`** before running the crew.

## Quick start

```bash
npm install
cp .env.example .env.local   # set the Supabase Auth + ANTHROPIC_API_KEY vars
npm run dev                  # http://localhost:3000
```

Open **`/`** for the landing page. **`/labs`** is the multi-agent app — sign
in or create an account at **`/login`** first; every private route redirects
there automatically if you're not authenticated.

That's it. Create an account, type a task in the Lab Console, and watch the
crew collaborate — your chats, memory, profile, and settings are yours alone.

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
  page.tsx                 # marketing showcase
  login/page.tsx           # sign in / create account / forgot password
  auth/callback/route.ts   # email confirmation + password-reset redirect
  api/
    chat/route.ts          # POST → run the crew (non-streaming), auth required
    chat/stream/route.ts   # POST → run the crew, streamed as SSE, auth required
    agents/route.ts        # GET  → agent roster + runtime info
    memory/route.ts        # GET/DELETE → per-user shared memory (filterable)
    health/route.ts        # GET  → readiness + ?ping / ?memory self-tests
middleware.ts               # protects /labs, /settings, /connections; redirects
                             # authenticated visitors away from /login

components/                # dark dashboard UI, grouped by feature
  auth/                    # LoginForm, SignOutButton
  dashboard/               # Dashboard shell, Sidebar, Integrations, AgentRoster
  chat/                    # Chat console + agent trace + run metrics
  memory/                  # MemoryExplorer (search + filters over shared memory)
  shared.ts                # shared client types, pricing/cost helper

providers/AuthProvider.tsx  # session/profile state, sign in/up/out, root-mounted
hooks/useAuth.ts            # useAuth() — consumes AuthProvider

lib/                       # framework-agnostic core
  auth/                    # getAuthedUser() (server identity), greeting helpers
  supabase/                # browser/server/middleware Supabase clients
  agents/                  # agent profiles, base agent, registry
  llm/                     # provider abstraction: Anthropic | OpenAI
  memory/                  # shared memory: Supabase (RLS, per-user) | in-process
  orchestration/crew.ts    # the multi-agent workflow (streaming generator)

supabase/schema.sql        # profiles + lab_memory tables, RLS policies
agents-py/                 # optional CrewAI-native mirror of the agents
Dockerfile · vercel.json   # deploy targets
.github/workflows/ci.yml   # typecheck + build on push/PR
```

### Features

- **Real accounts** — Supabase Auth (email + password): sign in, create
  account, forgot password, session restore, secure sign out. Every user has
  their own profile, chats, memory, and settings — enforced by Postgres Row
  Level Security, not just application code.
- **Streaming runs** — agents light up live via SSE as each one works
- **Sessions** — multiple named labs, each with isolated, persisted memory
- **Memory Explorer** — search/filter the shared memory by kind, author, text
- **Run metrics** — per-agent latency, token usage, and estimated cost
- **Connections cockpit** — live status for the LLM, Supabase, Robinhood, and
  GitHub, grouped into Connected / Ready to connect / Needs to be connected,
  with on-demand health checks

**Design principles:** modular (agents are declarative profiles; adding one is a
single entry) and provider-agnostic (swap Claude/OpenAI via env).

## Development authentication bypass (temporary)

Login is still unfinished (no SMTP/password recovery yet), so local dev and
Preview deployments can optionally skip sign-in with one explicit env var:

```bash
NORTHSTAR_DEV_NO_AUTH=1   # .env.local only — never set on Production
```

This never weakens Supabase Auth, middleware protection, or RLS, refuses to
activate on a real Vercel Production deployment, and forces ephemeral
in-process memory while active. Full details:
[`docs/DEV-AUTH-BYPASS.md`](docs/DEV-AUTH-BYPASS.md).

## Configuration

See `.env.example`. The lab auto-detects:

- **Authentication (required):** `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, with `supabase/schema.sql` applied to that
  project. Every private route (`/labs`, `/settings`, `/connections`) redirects
  to `/login` without a valid session.
- **Password reset:** hidden by default. Enable
  `NEXT_PUBLIC_PASSWORD_RESET_ENABLED=true` only after SMTP delivery and the
  recovery/update-password flow are configured.
- **LLM provider (required to answer):** `ANTHROPIC_API_KEY` → Claude, else
  `OPENAI_API_KEY` → OpenAI. Force with `LLM_PROVIDER`. Without a key the crew
  endpoints return a clear "not configured" error.
- **Shared memory:** uses the same Supabase project as Auth — per-user reads/
  writes authenticate as the signed-in user, so Row Level Security enforces
  isolation directly. `SUPABASE_SERVICE_ROLE_KEY` is optional and only used by
  the admin `/api/health?memory=1` diagnostic probe. Without Supabase Auth
  configured, memory falls back to in-process (still isolated per user within
  that process).
- **Robinhood Agentic Trading:** set `ROBINHOOD_MCP_TOKEN` (OAuth bearer from the
  Robinhood MCP connect flow) and explicitly allow owner emails with
  `TRADING_ALLOWED_USER_EMAILS`. The global connection is denied to every other
  account; production OAuth remains disabled until encrypted per-user token
  storage exists. The **Trader** joins only authorized crew runs.
  Verify with `GET /api/trading?probe=1`. Full setup: [`docs/TRADING.md`](docs/TRADING.md).

## Robinhood Agentic — go live

1. **Connect (desktop):** open `/labs` → Connections → **Connect Robinhood**
   (`GET /api/trading/oauth/start`), or use Cursor → Tools & MCPs with
   `https://agent.robinhood.com/mcp/trading` (see repo `.mcp.json`). Fund your
   **Agentic account** when Robinhood prompts.
2. Locally the token is saved to `.robinhood-mcp-token`; for deploy set
   `ROBINHOOD_MCP_TOKEN` on your host (e.g. Vercel → Environment Variables).
3. Set `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) — the Trader's tool loop needs a
   live model to drive the MCP tools.
4. Start with `TRADING_MODE=advisory`, probe with **Refresh checks** on `/labs`,
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
