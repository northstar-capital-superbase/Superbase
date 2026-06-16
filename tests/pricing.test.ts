import { describe, it, expect } from "vitest";
import { estimateCostUSD } from "@/components/shared";

describe("estimateCostUSD", () => {
  it("prices Opus at $5/$25 per 1M tokens", () => {
    // 1000 in * $5/1M + 500 out * $25/1M = 0.005 + 0.0125
    expect(estimateCostUSD("claude-opus-4-8", 1000, 500)).toBeCloseTo(0.0175, 6);
  });

  it("prices Sonnet at $3/$15 per 1M tokens", () => {
    expect(estimateCostUSD("claude-sonnet-4-6", 1000, 500)).toBeCloseTo(0.0105, 6);
  });

  it("returns null for unpriced models", () => {
    expect(estimateCostUSD("test-fake-1", 1000, 500)).toBeNull();
    expect(estimateCostUSD("some-unknown-model", 10, 10)).toBeNull();
  });

  it("matches by model-id prefix", () => {
    expect(estimateCostUSD("claude-haiku-4-5", 1_000_000, 0)).toBeCloseTo(1, 6);
  });
});
