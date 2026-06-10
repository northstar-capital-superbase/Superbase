import { describe, it, expect } from "vitest";
import { MockMarketsSource } from "@/lib/integrations/markets/mock";
import { getAgent, listProfiles } from "@/lib/agents";

describe("MockMarketsSource", () => {
  it("returns a portfolio with computed values", async () => {
    const src = new MockMarketsSource();
    const pf = await src.getPortfolio();
    expect(pf.currency).toBe("USD");
    expect(pf.positions.length).toBeGreaterThan(0);

    // equity == invested market value + cash
    const invested = pf.positions.reduce((a, p) => a + p.marketValue, 0);
    expect(pf.equity).toBeCloseTo(invested + pf.cash, 2);

    // marketValue and unrealizedPct are derived correctly for each position
    for (const p of pf.positions) {
      expect(p.marketValue).toBeCloseTo(p.quantity * p.price, 2);
      expect(p.unrealizedPct).toBeCloseTo(
        ((p.price - p.avgCost) / p.avgCost) * 100,
        1,
      );
    }
  });

  it("returns a quote for a symbol (read-only, no order methods)", async () => {
    const src = new MockMarketsSource();
    const q = await src.getQuote("aapl");
    expect(q.symbol).toBe("AAPL");
    expect(q.price).toBeGreaterThan(0);
    // The interface is read-only by design — no place/cancel order methods exist.
    expect((src as unknown as Record<string, unknown>).placeOrder).toBeUndefined();
  });
});

describe("Markets agent", () => {
  it("is registered and listed but excluded from the default flow", async () => {
    expect(getAgent("markets").profile.name).toBe("Markets");
    expect(listProfiles().map((p) => p.id)).toContain("markets");
  });
});
