# Northstar Labs — Multi-Agent AI Operating System

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

That's it. Type a task in the Lab Console and watch the crew collaborate.

## The agents

| Agent          | Role                       | Responsibility                                            |
| -------------- | -------------------------- | --------------------------------------------------------- |
| **Orchestrator** | Coordination & synthesis | Plans the workflow, delegates, and synthesizes the answer |
| **Research**     | Facts & context          | Surfaces facts, constraints, prior art, and unknowns      |
| **Strategist**   | Planning & sequencing    | Turns research into a concrete, sequenced plan            |
| **Behavioral**   | Risk & human factors     | Pressure-tests for failure modes, incentives, biases      |

### Workflow (the first working multi-agent loop)

```
user task
   │
   ▼
Orchestrator ── drafts a delegation plan ──▶ shared memory
   │
   ▼ (sequential, each reads prior outputs from shared memory)
Research ──▶ Strategist ──▶ Behavioral ──▶ shared memory
   │
   ▼
Orchestrator ── synthesizes everything ──▶ final answer + agent trace
```

Every step is written to **shared memory**, so agents build on each other within
a run and runs compound across a session.

## Architecture

```
app/
  page.tsx                 # dashboard entry
  api/
    chat/route.ts          # POST → runs the full crew workflow
    agents/route.ts        # GET  → agent roster + runtime info
    memory/route.ts        # GET/DELETE → shared memory
components/                # dark dashboard UI (Sidebar, Roster, Chat, Memory)
lib/
  agents/                  # agent profiles, base agent, registry
  llm/                     # provider abstraction: Anthropic | OpenAI | mock
  memory/                  # shared memory: Supabase | in-process
  orchestration/crew.ts    # the multi-agent workflow runner
supabase/schema.sql        # optional shared-memory table
agents-py/                 # optional CrewAI-native mirror of the agents
```

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
