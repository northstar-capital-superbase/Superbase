# @northstar/robinhood-mcp

Read-only Robinhood **market & portfolio** MCP server for Northstar Labs.

This is the optional **research tier** of the Robinhood integration. It exposes
quotes, fundamentals, account, portfolio, and positions as MCP tools with **no
order-placement surface** — there is no way to buy, sell, or cancel through this
server, by construction.

> For actual agentic trading, use the **official** hosted Robinhood MCP server
> (`https://agent.robinhood.com/mcp/trading`), registered in the repo root
> `.mcp.json` as `robinhood-trading`. See `../../docs/ROBINHOOD-MCP.md` for the
> full two-tier picture.

## Why this exists

Robinhood has no official _read-only_ API. This server talks to the same
unofficial HTTP endpoints the Robinhood web/mobile clients use, so an agent can
do portfolio research and market analysis without being granted any trading
ability. Use it when you want analysis with a zero blast radius.

⚠️ **Terms of service:** the unofficial endpoints are not a supported public API.
Use a dedicated account, respect Robinhood's ToS and rate limits, and treat this
as experimental Labs tooling.

## Tools

| Tool | Description | Auth |
| --- | --- | --- |
| `rh_authenticate` | Log in with username/password (+ MFA code) to obtain a session token | — |
| `rh_get_quotes` | Live quotes for one or more symbols | ✓ |
| `rh_get_historicals` | Historical OHLC candles | ✓ |
| `rh_get_fundamentals` | Company fundamentals (market cap, P/E, sector, 52w range) | ✓ |
| `rh_get_account` | Buying power, cash, account number | ✓ |
| `rh_get_portfolio` | Equity, market value, previous close | ✓ |
| `rh_get_positions` | Open positions with resolved symbols + cost basis | ✓ |
| `rh_search_instrument` | Search instruments by symbol/company name | ✓ |

## Build & run

```bash
cd mcp/robinhood
npm install
npm run build
ROBINHOOD_TOKEN=<session-token> npm start   # or call rh_authenticate at runtime
```

## Auth

Two options:

1. **Token (recommended for headless):** set `ROBINHOOD_TOKEN` to an existing
   session/bearer token. The server uses it directly.
2. **Interactive:** start without a token and call `rh_authenticate` with your
   `username`, `password`, and — if MFA is enabled — the current `mfaCode`.
   Reuse a stable `deviceToken` across logins to reduce device-approval prompts.

Credentials are used once to obtain a token and are never written to disk by
this server.

## Register as a local MCP server

Add to your MCP client config (e.g. a personal `.mcp.json`, not the committed
repo one, since this requires a local build):

```json
{
  "mcpServers": {
    "robinhood-research": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp/robinhood/dist/index.js"],
      "env": { "ROBINHOOD_TOKEN": "${ROBINHOOD_TOKEN}" }
    }
  }
}
```
