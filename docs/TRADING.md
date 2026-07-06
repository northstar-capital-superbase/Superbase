# Trading (Robinhood Agentic) — Northstar Labs

The **Trader** agent connects to Robinhood's hosted **Agentic Trading MCP**
(`https://agent.robinhood.com/mcp/trading`) to analyze the account and, when
enabled, place orders — always within an isolated, pre-funded Agentic account.

## Architecture

```
Trader agent ──> lib/mcp client (JSON-RPC / Streamable HTTP, bearer auth)
                      └─> agent.robinhood.com/mcp/trading
                 every order call ──> trading-policy (code-enforced gate) ──> audit → shared memory
```

- **`lib/mcp/client.ts`** — MCP client (initialize / tools.list / tools.call, SSE, timeout).
- **`lib/agents/trading-agent.ts`** — agentic tool loop; advisory fallback when no token.
- **`lib/mcp/trading-policy.ts`** — the safety gate (below).
- **`app/api/trading`** — server proxy (status / probe / list / call); token stays server-side.

## Setup

### Option A — In-app OAuth (recommended for Northstar Labs)

1. Open **`/labs`** → Integrations → **Connect Robinhood** (desktop browser).
2. Sign in at Robinhood and complete Agentic account onboarding if prompted.
3. Locally, the bearer token is saved to `.robinhood-mcp-token` (gitignored).
   For production, copy `ROBINHOOD_MCP_TOKEN` from the success page into your host env.
4. Verify: `GET /api/trading?probe=1` → `{ ok: true, toolCount: N }`.

Direct link: `GET /api/trading/oauth/start`

### Option B — Cursor / Claude MCP connect

1. Cursor → Settings → Tools & MCPs → Connect → `https://agent.robinhood.com/mcp/trading`
   (or use the `robinhood-trading` entry in repo `.mcp.json`).
2. Copy the bearer token into `.env.local` / deploy host:
   ```
   ROBINHOOD_MCP_TOKEN=...
   ```
3. Verify: `GET /api/trading?probe=1` → `{ ok: true, toolCount: N }`.

Without the token the Trader runs in **advisory mode** (analysis only, no live calls).

## Safety policy (enforced in code, not the prompt)

`TRADING_MODE` — **default `confirm`** (autonomy is opt-in, never assumed):
- `advisory` — read-only tools only; orders blocked. This is also the **kill switch**.
- `confirm` *(default)* — read-only auto; orders blocked in the autonomous loop (place them explicitly via `/api/trading`).
- `auto` — orders allowed, subject to the hard caps below. Any order whose notional **can't be verified is blocked (fail-closed)**.

| Env | Default | Effect |
|---|---|---|
| `TRADING_MAX_ORDER_USD` | `100` | reject any order over this notional (and any order of unknown size) |
| `TRADING_MAX_ORDERS_PER_RUN` | `3` | cap order placements per agent run |
| `TRADING_MUTATING_TOOLS` / `TRADING_READONLY_TOOLS` | — | correct the read-vs-order tool classification once live tool names are known |

**Runtime control:** `/labs` → Integrations exposes an operating-mode toggle and
a **Pause automation** kill switch. It calls `POST /api/trading?action=mode`,
sets a process-local override that **takes precedence over `TRADING_MODE`**, and
requires a confirm dialog to enable `auto`. (The override is in-process; for
multi-instance deploys, back it with a shared store.)

The Trader also only joins a run when the operator opts in (`/labs` → **Include
Trader**); it is never auto-added to every run.

The gate is applied in **both** the agent loop and the `/api/trading` proxy
(defense in depth). Every order decision (allowed or blocked) is **audited to
shared memory** (author `trader`) and the server log, so it shows in the run
trace and Memory Explorer.

> Real money: stay in `confirm` (or `advisory`), confirm the live `tools/list`
> names, set the caps you're comfortable with, then deliberately switch to
> `auto` — and remember the kill switch reverts instantly.

## Go live checklist

1. **Fund the Agentic account** in the Robinhood app (separate from primary portfolio).
2. **Obtain MCP bearer token** via Cursor → Settings → Tools & MCPs → Connect →
   `https://agent.robinhood.com/mcp/trading` (or Claude Code `claude mcp add …`).
3. **Set env on the server** (never in the browser):
   - `ROBINHOOD_MCP_TOKEN`
   - `ANTHROPIC_API_KEY` (Trader tool loop needs a live LLM)
   - `TRADING_MODE=advisory` first, then `auto`
   - `TRADING_MAX_ORDER_USD` / `TRADING_MAX_ORDERS_PER_RUN`
4. **Probe:** `GET /api/trading?probe=1` → `{ ok: true, toolCount: N }`.
5. **Dashboard:** open `/labs` → Integrations → **Run diagnostics** (Robinhood tile).
6. **Run a task** in the Lab Console — Trader should appear as the 4th specialist when MCP is configured.
7. **Deploy:** push `main` (or merge PR) — Vercel picks up env vars on redeploy.
