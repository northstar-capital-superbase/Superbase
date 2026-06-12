# Northstar Labs — UI Tour

A walkthrough of the interface and how a run flows through it. Pairs with a
**mock-mode preview** (no API keys needed — see "Push out a preview" below), so
the team can click through everything live.

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Nav: Home · Labs · Settings                          [ Open console ]   │
├─────────────────────────────────────────────────────────────────────────┤
│  HERO: "Operational core" — live crew status            [ Workspace ▾ ]  │
├─────────────────────────────────────────────────────────────────────────┤
│  Active agents — large alive cards (standby → active → complete)         │
├──────────────────────────────┬──────────────────────────────────────────┤
│  Running workflow strip      │  Autonomous activity (live memory stream) │
├──────────────────────────────┴──────────────────────────────────────────┤
│  Task console (chat)         │  Research & insights (generated intel)   │
└──────────────────────────────┴──────────────────────────────────────────┘
```

Technical configuration (LLM provider, memory backend, Robinhood MCP, GitHub,
diagnostics) lives under **Settings → Developer**, not on the Labs surface.

## The screens / components

1. **Labs hero** — large operational headline, live crew status, workspace switcher.
2. **Active agents** — premium agent cards that pulse and glow during runs.
3. **Workflow strip** — pipeline progress (plan → research → strategy → risk → execute).
4. **Autonomous activity** — live tail of what every agent reads and writes.
5. **Task console (chat)** — give intent; receive orchestrator synthesis with expandable trace.
6. **Research & insights** — distilled agent outputs, plans, and facts; Explore / Export / Clear.
7. **Settings → Developer** — runtime env, integrations tiles, **Run diagnostics**.
8. **Workspace switcher** — create/switch/delete labs; each keeps isolated memory and transcript.

## A run, as the user sees it

1. Type a task in the Task console, hit **Run**.
2. The **Orchestrator** card lights up (planning); the workflow strip advances.
3. **Research → Strategist → Behavioral** (and **Trader** when MCP is connected) light up
   in sequence; autonomous activity and insights fill in live.
4. The Orchestrator synthesizes; the final answer appears in the console.
5. Expand the trace to see each agent's work and run metrics.

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
