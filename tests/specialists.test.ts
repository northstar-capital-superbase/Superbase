import { describe, it, expect, afterEach } from "vitest";
import {
  BASE_SPECIALISTS,
  defaultSpecialists,
  resolveSpecialists,
} from "@/lib/agents/specialists";

describe("defaultSpecialists", () => {
  const original = process.env.ROBINHOOD_MCP_TOKEN;

  afterEach(() => {
    if (original === undefined) delete process.env.ROBINHOOD_MCP_TOKEN;
    else process.env.ROBINHOOD_MCP_TOKEN = original;
  });

  it("never auto-joins the trader, even when ROBINHOOD_MCP_TOKEN is set", () => {
    // Authority is granted, not assumed: the trader participates only when the
    // operator explicitly includes it (via resolveSpecialists).
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(defaultSpecialists()).toEqual(BASE_SPECIALISTS);
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    expect(defaultSpecialists()).toEqual(BASE_SPECIALISTS);
  });
});

describe("resolveSpecialists", () => {
  it("honours an explicit list", () => {
    expect(resolveSpecialists(["research"])).toEqual(["research"]);
  });

  it("includes the trader only when explicitly requested", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    expect(resolveSpecialists(["research", "strategist", "behavioral", "trader"])).toEqual([
      "research",
      "strategist",
      "behavioral",
      "trader",
    ]);
  });

  it("falls back to defaultSpecialists when empty", () => {
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(resolveSpecialists()).toEqual(BASE_SPECIALISTS);
    expect(resolveSpecialists(undefined)).toEqual(BASE_SPECIALISTS);
  });
});
