import { describe, it, expect } from "vitest";
import { lastActivityLabel, currentTaskLabel, type AgentStatus } from "@/lib/dashboard/crew";

const STATUSES: AgentStatus[] = ["idle", "thinking", "done"];

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
