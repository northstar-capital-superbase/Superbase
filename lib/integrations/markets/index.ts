import { MockMarketsSource } from "./mock";
import type { MarketsBackend, MarketsDataSource } from "./types";

export * from "./types";

let cached: MarketsDataSource | null = null;

// Resolves the markets data source. A real Robinhood adapter plugs in here once
// credentials are configured (ROBINHOOD_* env, or an MCP client). Until then,
// the deterministic mock keeps the Markets agent functional offline — the same
// mock-first pattern the rest of the lab uses.
export function getMarketsSource(): MarketsDataSource {
  if (cached) return cached;
  // Placeholder for the live adapter:
  //   if (process.env.ROBINHOOD_TOKEN) cached = new RobinhoodSource(...);
  cached = new MockMarketsSource();
  return cached;
}

export function marketsBackend(): MarketsBackend {
  return process.env.ROBINHOOD_TOKEN ? "robinhood" : "mock";
}

export function setMarketsSource(s: MarketsDataSource | null) {
  cached = s;
}
