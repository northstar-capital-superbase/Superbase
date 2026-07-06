import { describe, it, expect, beforeAll } from "vitest";
import {
  parseSynthesisMeta,
  runCrew,
  streamCrew,
  type CrewEvent,
} from "@/lib/orchestration/crew";
import { setProvider } from "@/lib/llm";
import { MockProvider } from "@/lib/llm/mock";

// Force the offline mock provider for deterministic, network-free runs.
beforeAll(() => setProvider(new MockProvider()));

describe("runCrew", () => {
  it("produces a plan, 3 specialist results, and a synthesis", async () => {
    const run = await runCrew({ sessionId: `run-${Date.now()}`, task: "plan a feature" });

    expect(run.plan).toBeTruthy();
    expect(run.specialistResults.map((r) => r.agent)).toEqual([
      "research",
      "strategist",
      "behavioral",
    ]);
    expect(run.synthesis.agent).toBe("orchestrator");
    expect(run.backend).toBe("in-memory");

    // Every recommendation carries confidence + consequence-of-inaction, and
    // the machine-readable trust block is stripped from the prose.
    expect(run.synthesis.confidence).toBeGreaterThanOrEqual(0);
    expect(run.synthesis.confidence).toBeLessThanOrEqual(100);
    expect(run.synthesis.consequenceOfInaction).toBeTruthy();
    expect(run.synthesis.output).not.toMatch(/CONFIDENCE:/);
    expect(run.synthesis.output).not.toMatch(/IF_YOU_DO_NOTHING:/);

    // Metrics threaded through every agent call.
    for (const r of run.specialistResults) {
      expect(r.ms).toBeGreaterThanOrEqual(0);
      expect(r.tokens?.input).toBeGreaterThan(0);
      expect(r.tokens?.output).toBeGreaterThan(0);
    }
  });
});

describe("streamCrew", () => {
  it("emits events in the expected order and ends with done", async () => {
    const types: CrewEvent["type"][] = [];
    let doneRun;
    for await (const ev of streamCrew({ sessionId: `stream-${Date.now()}`, task: "x" })) {
      types.push(ev.type);
      if (ev.type === "done") doneRun = ev.run;
    }

    // Orchestrator plans first, specialists run, then synthesis, then done.
    expect(types[0]).toBe("agent_start");
    expect(types).toContain("plan");
    expect(types).toContain("synthesis_start");
    expect(types).toContain("synthesis");
    expect(types[types.length - 1]).toBe("done");

    // Three specialist results streamed.
    expect(types.filter((t) => t === "agent_result")).toHaveLength(3);
    expect(doneRun?.specialistResults).toHaveLength(3);
    expect(types).not.toContain("error");
  });
});

describe("parseSynthesisMeta", () => {
  it("extracts confidence + consequence and strips the block", () => {
    const raw = [
      "Here is the recommendation.",
      "Do the thing.",
      "",
      "CONFIDENCE: 81",
      "IF_YOU_DO_NOTHING: Costs compound and the window closes.",
    ].join("\n");
    const { text, confidence, consequenceOfInaction } = parseSynthesisMeta(raw);
    expect(confidence).toBe(81);
    expect(consequenceOfInaction).toBe("Costs compound and the window closes.");
    expect(text).toContain("Do the thing.");
    expect(text).not.toMatch(/CONFIDENCE:|IF_YOU_DO_NOTHING:/);
  });

  it("clamps out-of-range confidence and tolerates a missing block", () => {
    expect(parseSynthesisMeta("CONFIDENCE: 250\nIF_YOU_DO_NOTHING: x").confidence).toBe(100);
    const none = parseSynthesisMeta("Just prose, no block.");
    expect(none.confidence).toBeUndefined();
    expect(none.consequenceOfInaction).toBeUndefined();
    expect(none.text).toBe("Just prose, no block.");
  });
});
