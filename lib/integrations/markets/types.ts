// Markets integration seam. Read-only by design: the lab can observe and
// analyze a brokerage account, but order execution is deliberately NOT part of
// this interface — placing trades is a separate, human-approved action.
//
// A concrete source (e.g. a Robinhood adapter or MCP client) implements this
// interface; until one is configured, the lab uses a deterministic mock so the
// Markets agent has data to reason over offline.

export interface Quote {
  symbol: string;
  price: number;
  changePct: number; // day change, %
}

export interface Position {
  symbol: string;
  quantity: number;
  avgCost: number;
  price: number;
  marketValue: number;
  unrealizedPct: number;
}

export interface Portfolio {
  currency: string;
  equity: number;
  cash: number;
  positions: Position[];
}

export type MarketsBackend = "robinhood" | "mock";

export interface MarketsDataSource {
  readonly name: MarketsBackend;
  getPortfolio(): Promise<Portfolio>;
  getQuote(symbol: string): Promise<Quote>;
}
