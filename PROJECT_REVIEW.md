# Northstar — Project Review Pack (for GPT / human reviewers)

> **Purpose:** One self-contained document to paste into ChatGPT (or attach with repo link) for architecture, UX, security, and go-live review.  
> **Repo:** [https://github.com/northstar-capital-superbase/Superbase](https://github.com/northstar-capital-superbase/Superbase)  
> **Review branch:** `cursor/northstar-os-ui-redesign-5717` (PR #11) unless noted.

---

## 1. Executive summary

**Northstar Labs** is a Next.js 14 (App Router) TypeScript app: a local-first **multi-agent Financial OS**.

- **Marketing:** `/` — Northstar OS showcase (strong visual identity).
- **Platform (PR #11):** `/dashboard`, `/labs`, `/agents`, `/research`, `/trading`, `/memory`, `/integrations`, `/settings` — shared `AppShell` (sidebar, mobile nav, ⌘K palette).
- **Core loop:** User task → Orchestrator plans → Research / Strategist / Behavioral (+ optional **Trader** if Robinhood MCP token) → synthesis → shared memory.
- **Defaults:** Mock LLM + in-memory memory (no API keys required).
- **Optional:** Anthropic/OpenAI, Supabase persistence, Robinhood Agentic MCP.

**Stack:** Next.js 14 · React 18 · Tailwind · Vitest · Supabase (optional) · Docker/Vercel deploy.

---

## 2. Information architecture


| Route           | Page                  | Primary component   |
| --------------- | --------------------- | ------------------- |
| `/`             | Homepage showcase     | `NorthstarShowcase` |
| `/tour`         | UI tour               | `app/tour/page.tsx` |
| `/dashboard`    | Mission Control       | `MissionControl`    |
| `/labs`         | R&D + crew console    | `LabsWorkspace`     |
| `/agents`       | Agent directory       | `AgentsDirectory`   |
| `/research`     | Intelligence terminal | `ResearchTerminal`  |
| `/trading`      | Trading console       | `TradingConsole`    |
| `/memory`       | Memory explorer       | `MemoryWorkspace`   |
| `/integrations` | Diagnostics           | `IntegrationsPage`  |
| `/settings`     | Environment summary   | `SettingsPanel`     |


**Shell:** `components/os/AppShell.tsx` — desktop sidebar, mobile drawer, bottom nav, command palette.

---

## 3. Architecture (3 layers)

```
components/*  ──fetch──▶  app/api/*  ──▶  lib/*
   (UI)                    (HTTP)         (engine)
```


| Layer         | Responsibility                                         |
| ------------- | ------------------------------------------------------ |
| `lib/`        | Agents, LLM, memory, MCP, orchestration — **no React** |
| `app/api/`    | Thin routes; secrets stay server-side                  |
| `components/` | UI only; never imports `lib/` directly                 |


**Crew flow:** `Dashboard/LabsWorkspace` → `POST /api/chat/stream` → `streamCrew()` → agents write/read `sessionId` memory → SSE events update UI.

See `docs/ARCHITECTURE.md` for detail.

---

## 4. Agents


| ID             | Name         | Role                               |
| -------------- | ------------ | ---------------------------------- |
| `orchestrator` | Orchestrator | Plan + synthesize                  |
| `research`     | Research     | Facts & context                    |
| `strategist`   | Strategist   | Sequencing & trade-offs            |
| `behavioral`   | Behavioral   | Bias & risk framing                |
| `trader`       | Trader       | Robinhood MCP tool loop (optional) |


**Trader joins crew when:** `ROBINHOOD_MCP_TOKEN` is set (`lib/agents/specialists.ts`).

**Trading safety:** `lib/mcp/trading-policy.ts` — `TRADING_MODE` (`advisory` | `confirm` | `auto`), order caps enforced in code + API proxy.

---

## 5. API reference


| Endpoint                            | Notes                               |
| ----------------------------------- | ----------------------------------- |
| `GET /api/health`                   | `{ provider, model, memory, mock }` |
| `GET /api/health?ping=1`            | Live LLM probe                      |
| `GET /api/health?memory=1`          | Memory round-trip                   |
| `GET /api/agents`                   | Roster + runtime + trading          |
| `POST /api/chat`                    | Sync crew run                       |
| `POST /api/chat/stream`             | SSE crew events                     |
| `GET/DELETE /api/memory?sessionId=` | Read / clear memory                 |
| `GET /api/trading`                  | MCP status                          |
| `GET /api/trading?probe=1`          | MCP handshake + tool count          |
| `POST /api/trading?action=tools\|call` | MCP proxy                           |


**OAuth (PR #10, separate branch):** `/api/trading/oauth/start`, `/api/trading/oauth/callback`.

---

## 6. Environment variables

Copy `.env.example` → `.env.local`. All optional for demo mode.


| Variable                                               | Effect                                            |
| ------------------------------------------------------ | ------------------------------------------------- |
| `ANTHROPIC_API_KEY`                                    | Live Claude (preferred if set)                    |
| `OPENAI_API_KEY`                                       | Live OpenAI                                       |
| `LLM_PROVIDER`                                         | Force anthropic, openai, or mock                  |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`           | Persistent memory                                 |
| `ROBINHOOD_MCP_TOKEN`                                  | Trader + Robinhood MCP                            |
| `TRADING_MODE`                                         | `advisory` (read-only orders) default recommended |
| `TRADING_MAX_ORDER_USD` / `TRADING_MAX_ORDERS_PER_RUN` | Hard caps                                         |
| `RATE_LIMIT_PER_MIN` / `MAX_TASK_CHARS`                | Abuse guardrails                                  |


---

## 7. Complete source file index

### App routes

- `app/layout.tsx` — root layout, viewport
- `app/page.tsx` — homepage
- `app/(os)/layout.tsx` — AppShell
- `app/(os)/dashboard/page.tsx`
- `app/(os)/labs/page.tsx`
- `app/(os)/agents/page.tsx`
- `app/(os)/research/page.tsx`
- `app/(os)/trading/page.tsx`
- `app/(os)/memory/page.tsx`
- `app/(os)/integrations/page.tsx`
- `app/(os)/settings/page.tsx`
- `app/tour/page.tsx`
- `app/api/health/route.ts`
- `app/api/agents/route.ts`
- `app/api/chat/route.ts`
- `app/api/chat/stream/route.ts`
- `app/api/memory/route.ts`
- `app/api/trading/route.ts`

### Design system & platform UI

- `components/os/*` — AppShell, nav, MetricCard, AgentCard, CommandPalette, etc.
- `components/mission/MissionControl.tsx`
- `components/labs/LabsWorkspace.tsx`
- `components/agents/AgentsDirectory.tsx`
- `components/research/ResearchTerminal.tsx`
- `components/trading/TradingConsole.tsx`
- `components/memory/MemoryWorkspace.tsx`
- `components/integrations/IntegrationsPage.tsx`
- `components/settings/SettingsPanel.tsx`
- `components/chat/Chat.tsx`
- `components/dashboard/Integrations.tsx`, `AgentRoster.tsx`
- `components/showcase/*` — marketing identity

### Core engine

- `lib/orchestration/crew.ts`
- `lib/agents/*` — profiles, base-agent, trading-agent, specialists
- `lib/llm/*` — anthropic, openai, mock
- `lib/memory/*` — in-memory, supabase
- `lib/mcp/*` — Robinhood client, trading-policy
- `lib/guardrails.ts`

### Tests (43)

- `tests/crew.test.ts`, `memory.test.ts`, `trading.test.ts`, `trading-policy.test.ts`, `specialists.test.ts`, `guardrails.test.ts`, `pricing.test.ts`

### Docs & ops

- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`
- `docs/ARCHITECTURE.md`, `DEPLOY.md`, `TRADING.md`, `UI-TOUR.md`
- `supabase/schema.sql`, `Dockerfile`, `vercel.json`, `.github/workflows/ci.yml`

---

## 8. Open PRs / branches (review scope)


| PR     | Branch                                 | Scope                                                      |
| ------ | -------------------------------------- | ---------------------------------------------------------- |
| #11    | `cursor/northstar-os-ui-redesign-5717` | OS shell, design system, mobile-first, new routes          |
| #10    | `cursor/robinhood-mcp-connection-5717` | OAuth connect, MCP session headers, `.robinhood-mcp-token` |
| `main` | —                                      | Through #8 Robinhood go-live wiring                        |


---

## 9. Run locally

```bash
git clone https://github.com/northstar-capital-superbase/Superbase.git
cd Superbase
git checkout cursor/northstar-os-ui-redesign-5717   # or main
npm ci
cp .env.example .env.local
npm run dev    # http://localhost:3000
npm test       # 43 tests
npm run build
```

**Smoke:** `curl http://localhost:3000/api/health`  
**Crew:** open `/labs`, submit a task.

---

## 10. Review checklist (for GPT)

Use this prompt structure after pasting this file:

1. **Architecture** — Is the 3-layer split sound? Any leakage of secrets to client?
2. **Multi-agent** — Crew ordering, memory contract, error handling?
3. **Trading safety** — Is policy enforcement sufficient for real money?
4. **UX / mobile** — AppShell vs homepage; gaps in Mission Control placeholders?
5. **Go-live** — Missing env docs, deploy steps, auth on public URLs?
6. **Tech debt** — Duplicate Sidebar, showcase vs platform styling, test coverage holes?
7. **Prioritized recommendations** — P0/P1/P2 with minimal diffs.

---

## 11. Known limitations (honest state)

- Dashboard portfolio metrics are placeholders until Robinhood MCP connected.
- Research terminal uses sample cards; not yet wired to live memory stream.
- Labs “Workflow Builder / Prompt Studio” are UI stubs.
- `main` does not include PR #10 OAuth or PR #11 shell until merged.
- No end-user auth on `/labs` — intended as personal/internal tool (see `docs/DEPLOY.md`).

---

*Generated for external LLM review. Do not paste real API keys or tokens into chat.*
