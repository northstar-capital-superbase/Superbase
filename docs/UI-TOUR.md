# Northstar Labs — UI Tour

A walkthrough of the interface and how a run flows through it. Pairs with a
**mock-mode preview** (no API keys needed — see "Push out a preview" below), so
the team can click through everything live.

## Layout

```
┌───────────┬──────────────────────────────────────────────────────────┐
│  Sidebar  │  Header: "Agent Operating System"        [ Lab ▾ ]        │
│           │──────────────────────────────────────────────────────────│
│ • brand   │  Integrations cockpit   [ Run diagnostics ]               │
│ • pipeline│   LLM · Memory · GitHub  (live status pills)               │
│ • runtime │──────────────────────────────────────────────────────────│
│           │  Agent roster:  Orchestrator  Research  Strategist  Behav. │
│           │──────────────────────────────────────┬───────────────────│
│           │  Lab Console (chat)                  │  Shared Memory      │
│           │   ▸ task input                       │   live tail         │
│           │   ▸ streamed answer + agent trace    │  [Explore][Export]  │
└───────────┴──────────────────────────────────────┴───────────────────┘
```

## The screens / components

1. **Sidebar** — brand, the 5-step pipeline legend, and a live **Runtime** panel
   (active model provider, model, memory backend).
2. **Integrations cockpit** — three status tiles (LLM provider, shared memory,
   GitHub) with a **Run diagnostics** button that live-tests connectivity and
   shows pass/fail + latency inline.
3. **Agent roster** — one card per agent. Cards **light up in real time** as each
   agent works during a run (idle → working → done).
4. **Lab Console (chat)** — the task input and the conversation. Each answer is
   the orchestrator's synthesis, with an expandable **agent trace**.
5. **Agent trace + run metrics** — under each answer: the plan, each specialist's
   output, and a metrics line (model · total latency · tokens in/out · agent
   calls · estimated cost).
6. **Shared Memory panel** — a live tail of what every agent reads/writes, with
   **Explore** (full search/filter modal) and **Export** (download the lab as
   Markdown).
7. **Lab switcher** (header) — create/switch/delete **labs**; each lab keeps its
   own isolated, persisted memory and transcript.

## A run, as the user sees it

1. Type a task in the Lab Console, hit **Run**.
2. The **Orchestrator** card lights up (planning).
3. **Research → Strategist → Behavioral** cards light up in sequence; the Shared
   Memory tail fills in live as each writes its contribution.
4. The Orchestrator card lights up again (synthesizing).
5. The final answer appears in the console; expand the trace to see each agent's
   work and the run metrics.

> In mock mode the agents return canned, role-appropriate text — perfect for
> reviewing the **flow and UI** without spending tokens. Add an Anthropic key
> later for live model output.

## Push out a preview (no secrets required)

The fastest way for the team to click around: deploy the branch to Vercel with
**no environment variables** — it boots in mock mode (mock LLM + in-memory).

1. [vercel.com](https://vercel.com) → **Add New → Project** → import
   `northstar-capital-superbase/superbase`.
2. Set **Production Branch** (or deploy a preview) to
   `claude/northstar-labs-setup-QVJAr`.
3. **Deploy** — leave env vars empty. Share the preview URL with the team.

See [`DEPLOY.md`](DEPLOY.md) for the full guide (and how to add live Claude +
Supabase later).
