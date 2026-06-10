# Robinhood MCP — Agentic Markets in Northstar Labs

This integration brings live markets and portfolio capability into the Northstar
Labs agent system through the **Model Context Protocol (MCP)**. It is built as
two complementary tiers so the lab can _research_ with zero risk and _execute_
with strong, structural guardrails.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Northstar Labs · Markets agent (lib/agents/profiles.ts → MARKETS)   │
│  Reasoning persona for finance/portfolio tasks. Opt-in specialist.   │
└───────────────┬─────────────────────────────────┬───────────────────┘
                │ research (read-only)            │ execution (trading)
        ┌───────▼────────────┐          ┌─────────▼─────────────────────┐
        │ robinhood-research │          │ robinhood-trading (OFFICIAL)  │
        │ local MCP, no order│          │ agent.robinhood.com/mcp/trading│
        │ surface (mcp/...)  │          │ OAuth · dedicated agent account│
        └────────────────────┘          └───────────────────────────────┘
```

## Tier 1 — `robinhood-trading` (official, primary)

Robinhood ships a **hosted, official** agentic-trading MCP server. It is the real
"agentic agent": it can read account/portfolio/buying-power **and place equity
orders**. It is registered in the repo-root [`.mcp.json`](../.mcp.json):

```json
"robinhood-trading": {
  "type": "http",
  "url": "https://agent.robinhood.com/mcp/trading"
}
```

### Connecting

Any MCP client can connect. With Claude Code:

```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

On first connect the client runs an **OAuth** flow — you authorize a **dedicated
Robinhood Agentic Trading account**, distinct from your primary brokerage
account. There are no API keys or secrets to store in the repo.

### Safety model (enforced by Robinhood, not by us)

- The agent connects to a **separate account class** — it never sees or touches
  your primary portfolio.
- The **blast radius is bounded** by whatever you pre-fund into the agent
  account.
- Beta scope is **equities only** (options, crypto, futures, event contracts are
  on Robinhood's roadmap).

Treat order placement as a deliberate, confirmed action. The Markets agent's
system prompt forbids placing/modifying/cancelling orders without an explicit,
unambiguous instruction and confirmation.

## Tier 2 — `robinhood-research` (optional, read-only)

A self-contained local MCP server at [`mcp/robinhood`](../mcp/robinhood) that
exposes **only read tools** — quotes, fundamentals, account, portfolio,
positions — with **no order surface at all**. Use it for analysis with a zero
blast radius, or when you don't want to grant any trading ability.

It talks to Robinhood's unofficial HTTP endpoints (no official read-only API
exists), so it is experimental Labs tooling — see its
[README](../mcp/robinhood/README.md) for auth, the tool list, and the ToS
caveat. It is **not** auto-registered in the committed `.mcp.json` because it
requires a local build; register it in a personal config when you want it.

## The Markets agent

`MARKETS` (`lib/agents/profiles.ts`) is the in-crew reasoning persona for
finance tasks. It is an **opt-in specialist**: it appears in the roster but is
deliberately kept out of the default crew order (`SPECIALIST_ORDER`), so it only
runs on market-related tasks rather than every request. Engage it explicitly:

```ts
await runCrew({ sessionId, task: "Assess AAPL given my portfolio", specialists: ["markets"] });
```

or via the API:

```bash
curl -X POST /api/chat -d '{"sessionId":"lab","task":"...","specialists":["markets"]}'
```

The agent is instructed to source every figure from the Robinhood MCP tools and
never invent prices, balances, or positions.

## Sources

- [Robinhood — Agentic Trading overview](https://robinhood.com/us/en/support/articles/agentic-trading-overview/)
- [Robinhood — Agentic Trading](https://robinhood.com/us/en/agentic-trading/)
- [Robinhood newsroom — "Robinhood is Now Open to Agents"](https://robinhood.com/us/en/newsroom/robinhood-is-now-open-to-agents/)
- [TechCrunch — Robinhood now lets your AI agents trade stocks](https://techcrunch.com/2026/05/27/robinhood-now-lets-your-ai-agents-trade-stocks/)
