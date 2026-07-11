import { describe, it, expect } from "vitest";
import {
  activityFromChatHistory,
  relativeTime,
  ACTIVITY_KIND_LABEL,
  type ActivityKind,
} from "@/lib/dashboard/activity";
import type { ChatSummary } from "@/components/labs/useChatHistory";

describe("activityFromChatHistory", () => {
  it("maps chat sessions to lab_session events without inventing data", () => {
    const history: ChatSummary[] = [
      { id: "1", title: "Plan Q3 budget", createdAt: "2024-01-01T00:00:00.000Z" },
    ];
    expect(activityFromChatHistory(history)).toEqual([
      {
        id: "1",
        kind: "lab_session",
        title: "Plan Q3 budget",
        timestamp: "2024-01-01T00:00:00.000Z",
        href: "/labs/console",
      },
    ]);
  });

  it("returns an empty timeline for empty history (no fabrication)", () => {
    expect(activityFromChatHistory([])).toEqual([]);
  });
});

describe("relativeTime", () => {
  const now = new Date("2024-01-02T00:00:00.000Z");

  it("says just now for the present moment", () => {
    expect(relativeTime(now.toISOString(), now)).toBe("just now");
  });

  it("formats minutes and hours", () => {
    expect(relativeTime(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe("5m ago");
    expect(relativeTime(new Date(now.getTime() - 3 * 3_600_000).toISOString(), now)).toBe("3h ago");
  });

  it("formats days within a week", () => {
    expect(relativeTime(new Date(now.getTime() - 2 * 86_400_000).toISOString(), now)).toBe("2d ago");
  });

  it("falls back to a safe label instead of NaN on bad input", () => {
    expect(relativeTime("not-a-date", now)).toBe("recently");
  });
});

describe("ACTIVITY_KIND_LABEL", () => {
  it("has a human label for every activity kind", () => {
    const kinds: ActivityKind[] = [
      "lab_session",
      "agent_run",
      "memory_update",
      "portfolio_analysis",
      "workflow",
      "research",
      "auth",
    ];
    for (const kind of kinds) {
      expect(ACTIVITY_KIND_LABEL[kind].length).toBeGreaterThan(0);
    }
  });
});
