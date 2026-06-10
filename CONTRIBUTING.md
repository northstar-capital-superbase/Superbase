# Contributing to Northstar Labs

Thanks for your interest! This is a local-first multi-agent AI lab — see
[`docs/NORTHSTAR.md`](docs/NORTHSTAR.md) — the master architecture — for how the pieces fit together.

## Setup

```bash
npm install
cp .env.example .env.local   # optional — runs in mock mode with no keys
npm run dev
```

## Before opening a PR

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # production build
```

All three run in CI on every push and pull request.

## Where things live

- `lib/` — framework-agnostic core (agents, llm, memory, orchestration)
- `app/api/` — thin HTTP routes that call `lib/`
- `components/` — UI, grouped by feature (`dashboard/`, `chat/`, `memory/`, `session/`)

## Extending

- **New agent:** add a profile in `lib/agents/profiles.ts`, register in `lib/agents/index.ts`
- **New LLM provider:** implement `LLMProvider` (`lib/llm/types.ts`), wire in `lib/llm/index.ts`
- **New memory backend:** implement `MemoryStore` (`lib/memory/types.ts`), wire in `lib/memory/index.ts`
