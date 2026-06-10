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

1. Connect Robinhood Agentic Trading and obtain the MCP bearer token
   (Robinhood → Agentic Trading; or `claude mcp add` / Cursor MCP connect).
2. Set it where the app runs (`.env.local` or your deploy host):
   ```
   ROBINHOOD_MCP_TOKEN=...
   ```
3. Verify: `GET /api/trading?probe=1` → `{ ok: true, toolCount: N }`.

Without the token the Trader runs in **advisory mode** (analysis only, no live calls).

## Safety policy (enforced in code, not the prompt)

`TRADING_MODE`:
- `advisory` — read-only tools only; orders blocked.
- `confirm` — read-only auto; orders blocked in the autonomous loop (place them explicitly via `/api/trading`).
- `auto` *(default)* — orders allowed, subject to the hard caps:

| Env | Default | Effect |
|---|---|---|
| `TRADING_MAX_ORDER_USD` | `100` | reject any order over this notional |
| `TRADING_MAX_ORDERS_PER_RUN` | `3` | cap order placements per agent run |
| `TRADING_MUTATING_TOOLS` / `TRADING_READONLY_TOOLS` | — | correct the read-vs-order tool classification once live tool names are known |

The gate is applied in **both** the agent loop and the `/api/trading` proxy
(defense in depth). Every order decision (allowed or blocked) is **audited to
shared memory** (author `trader`) and the server log, so it shows in the run
trace and Memory Explorer.

> Real money: start in `advisory`, confirm the live `tools/list` names, set the
> caps you're comfortable with, then move to `auto`.
