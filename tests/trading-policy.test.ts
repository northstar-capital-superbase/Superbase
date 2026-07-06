import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isMutatingTool,
  estimateNotionalUsd,
  evaluateToolCall,
  tradingMode,
  tradingModeSource,
  setTradingModeOverride,
} from "@/lib/mcp/trading-policy";

// Snapshot/restore the policy env so tests are independent.
const KEYS = ["TRADING_MODE", "TRADING_MAX_ORDER_USD", "TRADING_MAX_ORDERS_PER_RUN"];
let saved: Record<string, string | undefined>;
beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
  setTradingModeOverride(null);
});
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  setTradingModeOverride(null);
});

describe("isMutatingTool", () => {
  it("treats read-style tools as read-only", () => {
    for (const n of ["get_portfolio", "list_orders", "get_quote", "account_balance", "search_instruments"]) {
      expect(isMutatingTool(n)).toBe(false);
    }
  });
  it("treats order placement/cancellation as mutating", () => {
    for (const n of ["place_order", "submit_order", "cancel_order", "create_order", "buy", "sell"]) {
      expect(isMutatingTool(n)).toBe(true);
    }
  });
  it("respects env overrides", () => {
    process.env.TRADING_READONLY_TOOLS = "place_order";
    expect(isMutatingTool("place_order")).toBe(false);
    delete process.env.TRADING_READONLY_TOOLS;
  });
});

describe("estimateNotionalUsd", () => {
  it("reads explicit notional fields", () => {
    expect(estimateNotionalUsd({ notional: 250 })).toBe(250);
    expect(estimateNotionalUsd({ amount_usd: "75.5" })).toBe(75.5);
  });
  it("derives quantity * price", () => {
    expect(estimateNotionalUsd({ quantity: 10, limit_price: 20 })).toBe(200);
  });
  it("returns null when undeterminable", () => {
    expect(estimateNotionalUsd({ symbol: "AAPL" })).toBeNull();
  });
});

describe("tradingMode", () => {
  it("defaults to confirm (autonomy is opt-in)", () => {
    expect(tradingMode()).toBe("confirm");
    expect(tradingModeSource()).toBe("default");
  });

  it("reads a valid env value", () => {
    process.env.TRADING_MODE = "auto";
    expect(tradingMode()).toBe("auto");
    expect(tradingModeSource()).toBe("env");
  });

  it("runtime override wins over env (kill switch)", () => {
    process.env.TRADING_MODE = "auto";
    setTradingModeOverride("advisory");
    expect(tradingMode()).toBe("advisory");
    expect(tradingModeSource()).toBe("override");
  });
});

describe("evaluateToolCall", () => {
  it("always allows read-only tools", () => {
    process.env.TRADING_MODE = "advisory";
    expect(evaluateToolCall("get_portfolio", {}, 0).allow).toBe(true);
  });

  it("blocks orders by default (confirm mode)", () => {
    // No TRADING_MODE set → default confirm → mutations blocked.
    const d = evaluateToolCall("place_order", { quantity: 1, limit_price: 5 }, 0);
    expect(d.allow).toBe(false);
    expect(d.mutating).toBe(true);
  });

  it("auto mode fails closed when the order size can't be verified", () => {
    process.env.TRADING_MODE = "auto";
    // No parseable notional (symbol only) → blocked, not allowed.
    const d = evaluateToolCall("place_order", { symbol: "AAPL", side: "buy" }, 0);
    expect(d.allow).toBe(false);
    expect(d.reason).toMatch(/could not be verified|fail-closed/);
  });

  it("advisory mode blocks orders", () => {
    process.env.TRADING_MODE = "advisory";
    const d = evaluateToolCall("place_order", { quantity: 1, limit_price: 5 }, 0);
    expect(d.allow).toBe(false);
    expect(d.mutating).toBe(true);
  });

  it("auto mode allows orders under the notional cap", () => {
    process.env.TRADING_MODE = "auto";
    process.env.TRADING_MAX_ORDER_USD = "100";
    expect(evaluateToolCall("place_order", { quantity: 2, limit_price: 10 }, 0).allow).toBe(true);
  });

  it("auto mode blocks orders over the notional cap", () => {
    process.env.TRADING_MODE = "auto";
    process.env.TRADING_MAX_ORDER_USD = "100";
    const d = evaluateToolCall("place_order", { quantity: 50, limit_price: 10 }, 0);
    expect(d.allow).toBe(false);
    expect(d.reason).toMatch(/cap/);
  });

  it("auto mode enforces the per-run order cap", () => {
    process.env.TRADING_MODE = "auto";
    process.env.TRADING_MAX_ORDERS_PER_RUN = "2";
    expect(evaluateToolCall("place_order", { notional: 5 }, 2).allow).toBe(false);
  });
});
