import { describe, it, expect } from "vitest";
import {
  crewSummary,
  lastActivityLabel,
  currentTaskLabel,
  type AgentStatus,
} from "@/lib/dashboard/crew";
import { pipelineAgentIds } from "@/components/shared";

const STATUSES: AgentStatus[] = ["idle", "thinking", "done"];

describe("crewSummary", () => {
  it("never claims readiness before runtime configuration is known", () => {
    expect(
      crewSummary({ state: "ready", runtimeLoaded: false, configured: false, count: 4 }),
    ).toBe("Checking crew…");
    expect(
      crewSummary({ state: "ready", runtimeLoaded: true, configured: false, count: 4 }),
    ).toBe("Crew unavailable · add a model key");
  });

  it("describes configured agents as available rather than online", () => {
    expect(
      crewSummary({ state: "ready", runtimeLoaded: true, configured: true, count: 4 }),
    ).toBe("Crew ready · 4 agents available");
  });

  it("states the error plainly (the Retry affordance carries the action)", () => {
    expect(
      crewSummary({ state: "error", runtimeLoaded: true, configured: true, count: 0 }),
    ).toBe("Crew status unavailable");
  });
});

describe("pipelineAgentIds", () => {
  it("only includes Trader when trading is available", () => {
    expect(pipelineAgentIds(false)).not.toContain("trader");
    expect(pipelineAgentIds(true)).toContain("trader");
  });
});

describe("lastActivityLabel", () => {
  it("is honest for every status (no invented timestamps)", () => {
    expect(lastActivityLabel("idle")).toBe("No recent activity");
    expect(lastActivityLabel("thinking")).toBe("In progress");
    expect(lastActivityLabel("done")).toBe("Just completed a task");
  });

  it("returns a non-empty label for every possible status", () => {
    for (const status of STATUSES) {
      expect(lastActivityLabel(status).length).toBeGreaterThan(0);
    }
  });
});

describe("currentTaskLabel", () => {
  it("only claims an active task while thinking", () => {
    expect(currentTaskLabel("idle")).toBe("No active task");
    expect(currentTaskLabel("done")).toBe("No active task");
    expect(currentTaskLabel("thinking")).toBe("Working on the current run");
  });
});
