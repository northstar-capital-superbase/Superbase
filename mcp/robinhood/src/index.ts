#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RobinhoodClient, RobinhoodError } from "./robinhood.js";

// ── Northstar Labs · Robinhood MCP (read-only) ───────────────────────────────
// Exposes Robinhood market & portfolio data as MCP tools. There is NO order
// surface here — every tool is read-only by construction. A token can be
// supplied via ROBINHOOD_TOKEN; otherwise call `rh_authenticate` first.

const client = new RobinhoodClient(process.env.ROBINHOOD_TOKEN);

const server = new McpServer({
  name: "northstar-robinhood",
  version: "0.1.0",
});

// Wrap a handler so any RobinhoodError becomes a clean tool error rather than a
// crash, and successful payloads are returned as pretty JSON text.
function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function fail(err: unknown) {
  const msg =
    err instanceof RobinhoodError
      ? `${err.message}${err.status ? ` (HTTP ${err.status})` : ""}`
      : err instanceof Error
        ? err.message
        : String(err);
  return { isError: true, content: [{ type: "text" as const, text: `Error: ${msg}` }] };
}

server.tool(
  "rh_authenticate",
  "Authenticate to Robinhood with username/password (and an MFA code if enabled). " +
    "Only needed when ROBINHOOD_TOKEN is not set. Credentials are used once to obtain a session token and are never stored.",
  {
    username: z.string().describe("Robinhood account email/username"),
    password: z.string().describe("Robinhood account password"),
    mfaCode: z.string().optional().describe("Current TOTP/SMS code if MFA is enabled"),
    deviceToken: z.string().optional().describe("Stable device UUID to reuse across logins"),
  },
  async ({ username, password, mfaCode, deviceToken }) => {
    try {
      const auth = await client.login({ username, password, mfaCode, deviceToken });
      return ok({
        authenticated: true,
        expiresAt: auth.expiresAt ? new Date(auth.expiresAt).toISOString() : null,
      });
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_quotes",
  "Live quotes (last trade, bid/ask, previous close) for one or more symbols.",
  { symbols: z.array(z.string()).min(1).describe("Ticker symbols, e.g. ['AAPL','MSFT']") },
  async ({ symbols }) => {
    try {
      const res = await client.quotes(symbols);
      return ok(res.results);
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_historicals",
  "Historical OHLC candles for one or more symbols.",
  {
    symbols: z.array(z.string()).min(1).describe("Ticker symbols"),
    interval: z
      .enum(["5minute", "10minute", "hour", "day", "week"])
      .default("day")
      .describe("Candle interval"),
    span: z
      .enum(["day", "week", "month", "3month", "year", "5year"])
      .default("year")
      .describe("Lookback window"),
  },
  async ({ symbols, interval, span }) => {
    try {
      const res = await client.historicals(symbols, interval, span);
      return ok(res.results);
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_fundamentals",
  "Company fundamentals for a symbol (market cap, P/E, sector, 52w range, description).",
  { symbol: z.string().describe("Ticker symbol, e.g. 'AAPL'") },
  async ({ symbol }) => {
    try {
      return ok(await client.fundamentals(symbol));
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_account",
  "Brokerage account summary (buying power, cash, account number). Requires auth.",
  {},
  async () => {
    try {
      const res = await client.accounts();
      return ok(res.results);
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_portfolio",
  "Portfolio snapshot (equity, market value, previous close). Requires auth.",
  {},
  async () => {
    try {
      const res = await client.portfolios();
      return ok(res.results);
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_get_positions",
  "Open positions with their resolved ticker symbols and cost basis. Requires auth.",
  { nonzero: z.boolean().default(true).describe("Only return open (non-zero) positions") },
  async ({ nonzero }) => {
    try {
      const res = await client.positions(nonzero);
      // Resolve each position's instrument URL to a human ticker symbol.
      const enriched = await Promise.all(
        res.results.map(async (p) => {
          let symbol: string | null = null;
          try {
            symbol = (await client.instrument(p.instrument)).symbol;
          } catch {
            /* leave symbol null if the instrument lookup fails */
          }
          return {
            symbol,
            quantity: p.quantity,
            average_buy_price: p.average_buy_price,
            updated_at: p.updated_at,
          };
        }),
      );
      return ok(enriched);
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "rh_search_instrument",
  "Search tradeable instruments by symbol or company name.",
  { query: z.string().min(1).describe("Symbol or company name") },
  async ({ query }) => {
    try {
      const res = await client.searchInstruments(query);
      return ok(
        res.results.map((i) => ({
          symbol: i.symbol,
          name: i.simple_name ?? i.name,
          tradeable: i.tradeable,
        })),
      );
    } catch (err) {
      return fail(err);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs go to stderr so they don't corrupt the stdio JSON-RPC stream.
  console.error("northstar-robinhood MCP server ready (read-only).");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
