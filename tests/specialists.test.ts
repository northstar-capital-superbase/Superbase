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

  it("excludes trader when ROBINHOOD_MCP_TOKEN is unset", () => {
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(defaultSpecialists()).toEqual(BASE_SPECIALISTS);
  });

  it("includes trader when ROBINHOOD_MCP_TOKEN is set", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    expect(defaultSpecialists()).toEqual([...BASE_SPECIALISTS, "trader"]);
  });
});

describe("resolveSpecialists", () => {
  it("honours an explicit list", () => {
    expect(resolveSpecialists(["research"])).toEqual(["research"]);
  });

  it("falls back to defaultSpecialists when empty", () => {
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(resolveSpecialists()).toEqual(BASE_SPECIALISTS);
    expect(resolveSpecialists(undefined)).toEqual(BASE_SPECIALISTS);
  });
});
