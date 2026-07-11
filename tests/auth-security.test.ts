import { afterEach, describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { tradingAllowedFor } from "@/lib/mcp/access";
import { settingsKeyForUser } from "@/components/settings/types";
import { resolveSpecialists } from "@/lib/agents/specialists";

describe("safeRedirectPath", () => {
  it("keeps local application paths", () => {
    expect(safeRedirectPath("/settings?section=auth")).toBe(
      "/settings?section=auth",
    );
  });

  it.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "javascript:alert(1)",
    "",
  ])("rejects unsafe redirect %j", (candidate) => {
    expect(safeRedirectPath(candidate)).toBe("/labs");
  });
});

describe("trading authorization", () => {
  const originalToken = process.env.ROBINHOOD_MCP_TOKEN;
  const originalAllowlist = process.env.TRADING_ALLOWED_USER_EMAILS;

  afterEach(() => {
    if (originalToken === undefined) delete process.env.ROBINHOOD_MCP_TOKEN;
    else process.env.ROBINHOOD_MCP_TOKEN = originalToken;
    if (originalAllowlist === undefined) {
      delete process.env.TRADING_ALLOWED_USER_EMAILS;
    } else {
      process.env.TRADING_ALLOWED_USER_EMAILS = originalAllowlist;
    }
  });

  it("fails closed without an explicit allowlist", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    delete process.env.TRADING_ALLOWED_USER_EMAILS;
    expect(tradingAllowedFor("owner@example.com")).toBe(false);
  });

  it("matches allowlisted emails case-insensitively", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    process.env.TRADING_ALLOWED_USER_EMAILS =
      "other@example.com, OWNER@example.com";
    expect(tradingAllowedFor("owner@example.com")).toBe(true);
    expect(tradingAllowedFor("beta@example.com")).toBe(false);
  });

  it("cannot force the trader through a client specialist list", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    expect(resolveSpecialists(["trader"], false)).toEqual([
      "research",
      "strategist",
      "behavioral",
    ]);
  });
});

describe("settings storage isolation", () => {
  it("uses a distinct key for every authenticated user", () => {
    expect(settingsKeyForUser("user-a")).not.toBe(
      settingsKeyForUser("user-b"),
    );
    expect(settingsKeyForUser("user-a")).toBe(
      "northstar.settings.v2.user-a",
    );
  });
});
