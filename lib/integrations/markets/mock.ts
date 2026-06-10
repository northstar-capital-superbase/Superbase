import type {
  MarketsDataSource,
  Portfolio,
  Position,
  Quote,
} from "./types";

// Deterministic offline markets data so the Markets agent runs with no
// brokerage connection. Replace with a real adapter when configured.
const SEED: Array<Omit<Position, "marketValue" | "unrealizedPct">> = [
  { symbol: "AAPL", quantity: 12, avgCost: 178.4, price: 213.55 },
  { symbol: "MSFT", quantity: 6, avgCost: 402.1, price: 441.2 },
  { symbol: "NVDA", quantity: 9, avgCost: 98.7, price: 131.4 },
  { symbol: "SPY", quantity: 15, avgCost: 512.0, price: 548.9 },
];

function enrich(p: (typeof SEED)[number]): Position {
  const marketValue = round(p.quantity * p.price);
  const unrealizedPct = round(((p.price - p.avgCost) / p.avgCost) * 100, 2);
  return { ...p, marketValue, unrealizedPct };
}

export class MockMarketsSource implements MarketsDataSource {
  readonly name = "mock" as const;

  async getPortfolio(): Promise<Portfolio> {
    const positions = SEED.map(enrich);
    const invested = positions.reduce((a, p) => a + p.marketValue, 0);
    const cash = 8450.25;
    return {
      currency: "USD",
      equity: round(invested + cash),
      cash,
      positions,
    };
  }

  async getQuote(symbol: string): Promise<Quote> {
    const found = SEED.find((p) => p.symbol === symbol.toUpperCase());
    const price = found?.price ?? 100;
    return {
      symbol: symbol.toUpperCase(),
      price,
      changePct: round(((symbol.length % 5) - 2) * 0.83, 2), // stable pseudo-change
    };
  }
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
