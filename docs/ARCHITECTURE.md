# Northstar Labs — Architecture

A map of how the pieces fit together, for anyone reading the codebase fresh.

## The big picture

```
 Browser (dashboard)                    Server (Next.js API)                Core (lib/)
 ───────────────────                    ────────────────────                ───────────
 components/dashboard ──fetch──▶ app/api/chat/stream ──▶ lib/orchestration/crew
 components/chat                  app/api/chat             │  ├─ lib/agents      (who)
 components/memory                app/api/memory           │  ├─ lib/llm         (think)
 components/session               app/api/agents           │  └─ lib/memory      (remember)
 components/dashboard/Integrations app/api/health
```

Three layers, each independent:

1. **`lib/` — the core.** No React, no Next.js. The multi-agent engine.
2. **`app/api/` — the seam.** Thin HTTP routes that call `lib/` and shape JSON/SSE.
3. **`components/` — the UI.** Talks only to `app/api/`, never to `lib/` directly.

## A request, end to end

When you submit a task in the Chat console:

1. **`components/dashboard/Dashboard.tsx`** POSTs to **`/api/chat/stream`**.
2. **`app/api/chat/stream/route.ts`** calls **`streamCrew()`** and pipes each
   yielded event to the browser as a Server-Sent Event.
3. **`lib/orchestration/crew.ts`** runs the workflow:
   - the **orchestrator** (`lib/agents`) drafts a plan,
   - **research → strategist → behavioral** run in sequence, each reading the
     accumulated **shared memory** (`lib/memory`) so they build on each other,
   - the **orchestrator** synthesizes the final answer.
   - Every step is written to shared memory and emitted as a `CrewEvent`.
4. Each agent turn goes through **`lib/agents/base-agent.ts`**, which calls the
   active **LLM provider** (`lib/llm` — Anthropic, OpenAI, or the offline mock).
5. The dashboard updates agent statuses live, refreshes the memory tail, and on
   `done` renders the answer with its **run metrics** (latency, tokens, cost).

## Key abstractions (swap one piece without touching the rest)

| Concern | Interface | Implementations |
|---|---|---|
| LLM provider | `lib/llm/types.ts` `LLMProvider` | `anthropic.ts`, `openai.ts`, `mock.ts` |
| Shared memory | `lib/memory/types.ts` `MemoryStore` | `supabase-store.ts`, `in-memory-store.ts` |
| Agent | `lib/agents/base-agent.ts` `Agent` | data-driven from `profiles.ts` |

Each is resolved from env at runtime (`lib/llm/index.ts`, `lib/memory/index.ts`)
with a safe default (mock LLM, in-memory store) so the app always runs.

## Adding things

- **A new agent:** add a profile to `lib/agents/profiles.ts` and register it in
  `lib/agents/index.ts`. The orchestration loop is data-driven.
- **A new LLM provider:** implement `LLMProvider`, wire it in `lib/llm/index.ts`.
- **A new memory backend:** implement `MemoryStore`, wire it in
  `lib/memory/index.ts`.

## Data flow invariants

- The **client never imports `lib/`** — it only calls `app/api/`. This keeps
  secrets (API keys, service-role key) server-side.
- **Shared memory is the contract** between agents: they don't call each other,
  they read/write a common store keyed by `sessionId` (the "lab").
- **Sessions** isolate memory by id; the lab list lives in the browser
  (`components/session/useSessions.ts`), the memory itself in the backend.
