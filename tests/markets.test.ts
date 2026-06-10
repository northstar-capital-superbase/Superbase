import { describe, it, expect, beforeAll } from "vitest";
import { runCrew } from "@/lib/orchestration/crew";
import { setProvider } from "@/lib/llm";
import { MockProvider } from "@/lib/llm/mock";
import { SPECIALIST_ORDER } from "@/lib/agents";
import { ALL_PROFILES } from "@/lib/agents/profiles";

beforeAll(() => setProvider(new MockProvider()));

describe("markets agent", () => {
  it("is registered in the roster but kept OUT of the default crew order", () => {
    // Visible as an available specialist...
    expect(ALL_PROFILES.map((p) => p.id)).toContain("markets");
    // ...but opt-in: it must not run on every task (keeps the default flow lean
    // and the finance MCP out of unrelated runs).
    expect(SPECIALIST_ORDER).not.toContain("markets");
  });

  it("runs as an explicit specialist and produces market-flavored output", async () => {
    const run = await runCrew({
      sessionId: `mkt-${Date.now()}`,
      task: "Assess AAPL given my portfolio",
      specialists: ["markets"],
    });

    expect(run.specialistResults.map((r) => r.agent)).toEqual(["markets"]);
    const out = run.specialistResults[0].output;
    expect(out).toContain("Markets read");
    // The mock makes the data provenance explicit — never invented prices.
    expect(out).toContain("Robinhood MCP");
  });
});
