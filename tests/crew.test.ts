import { describe, it, expect, beforeAll } from "vitest";
import { runCrew, streamCrew, type CrewEvent } from "@/lib/orchestration/crew";
import { setProvider } from "@/lib/llm";
import { memoryBackend } from "@/lib/memory";
import { FakeProvider } from "./fake-provider";

// Force a deterministic, network-free provider for tests.
beforeAll(() => setProvider(new FakeProvider()));

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
    expect(run.backend).toBe(memoryBackend());

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
