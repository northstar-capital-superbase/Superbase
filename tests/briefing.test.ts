import { describe, it, expect } from "vitest";
import {
  buildBriefing,
  buildPendingItems,
  type CommandCenterSignals,
} from "@/lib/dashboard/briefing";

const base: CommandCenterSignals = {
  configured: true,
  memory: "in-memory",
  tradingEnabled: false,
  hasDisplayName: true,
  hasSessions: false,
};

describe("buildBriefing", () => {
  it("prompts for a model key when the runtime is not configured", () => {
    const text = buildBriefing({ ...base, configured: false });
    expect(text).toContain("Add a model key");
    expect(text).not.toContain("brokerage is connected");
  });

  it("reports configured + no brokerage and invites first steps", () => {
    const text = buildBriefing(base);
    expect(text).toContain("Your account is configured.");
    expect(text).toContain("No financial accounts are connected yet.");
    expect(text).toContain("connect your first brokerage");
  });

  it("acknowledges a connected brokerage", () => {
    const text = buildBriefing({ ...base, tradingEnabled: true });
    expect(text).toContain("a brokerage is connected");
    expect(text).not.toContain("No financial accounts");
  });

  it("nudges returning users to resume when sessions exist", () => {
    const text = buildBriefing({ ...base, hasSessions: true });
    expect(text).toContain("Pick up where you left off");
  });
});

describe("buildPendingItems", () => {
  it("lists model key, profile, and brokerage for a fresh account", () => {
    const items = buildPendingItems({
      configured: false,
      memory: null,
      tradingEnabled: false,
      hasDisplayName: false,
      hasSessions: false,
    });
    expect(items.map((i) => i.id)).toEqual(["model-key", "profile", "brokerage"]);
  });

  it("only surfaces the brokerage item when the account is otherwise set up", () => {
    const items = buildPendingItems(base);
    expect(items.map((i) => i.id)).toEqual(["brokerage"]);
  });

  it("returns nothing when everything is configured", () => {
    const items = buildPendingItems({
      configured: true,
      memory: "supabase",
      tradingEnabled: true,
      hasDisplayName: true,
      hasSessions: true,
    });
    expect(items).toEqual([]);
  });

  it("every pending item has an actionable destination", () => {
    const items = buildPendingItems({
      configured: false,
      memory: null,
      tradingEnabled: false,
      hasDisplayName: false,
      hasSessions: false,
    });
    for (const item of items) {
      expect(item.href).toMatch(/^\//);
      expect(item.cta.length).toBeGreaterThan(0);
    }
  });
});
