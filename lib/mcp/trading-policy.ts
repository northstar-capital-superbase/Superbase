// Trading safety policy — enforced in CODE (not just the prompt), so an LLM
// cannot talk its way past it. Applied in both the Trader agent's tool loop and
// the /api/trading proxy (defense in depth).
//
// Modes (TRADING_MODE):
//   advisory — read-only tools only; all order mutations blocked
//   confirm  — read-only auto; mutations blocked in the autonomous loop
//              (a human must execute them explicitly via /api/trading)
//   auto     — mutations allowed, subject to the hard caps below
//
// Hard caps (apply in auto mode):
//   TRADING_MAX_ORDER_USD       max notional per order   (default 100)
//   TRADING_MAX_ORDERS_PER_RUN  max mutating calls / run (default 3)
//
// Classification can be corrected once the live tool list is known via
// TRADING_MUTATING_TOOLS / TRADING_READONLY_TOOLS (comma-separated names).

export type TradingMode = "advisory" | "confirm" | "auto";

export function tradingMode(): TradingMode {
  const m = (process.env.TRADING_MODE || "auto").toLowerCase();
  return m === "advisory" || m === "confirm" || m === "auto" ? m : "auto";
}

export function maxOrderUsd(): number {
  const n = Number(process.env.TRADING_MAX_ORDER_USD);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

export function maxOrdersPerRun(): number {
  const n = Number(process.env.TRADING_MAX_ORDERS_PER_RUN);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

function envList(name: string): string[] {
  return (process.env[name] || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Heuristic classifier (overridable by env). A tool is "mutating" if it places,
// cancels, or modifies orders/positions. Read-style verbs keep it read-only.
export function isMutatingTool(name: string): boolean {
  const n = name.toLowerCase();
  if (envList("TRADING_READONLY_TOOLS").includes(n)) return false;
  if (envList("TRADING_MUTATING_TOOLS").includes(n)) return true;

  const readOnly =
    /(^|_)(get|list|fetch|read|search|status|history|quote|quotes|price|prices|position|positions|portfolio|account|balance|info|holdings)(_|$)/.test(
      n,
    );
  const mutating =
    /(place|submit|create|cancel|modify|replace|buy|sell|liquidat|close)/.test(n);
  // "create_order" etc. is mutating even though "get_orders" is not.
  if (mutating && !readOnly) return true;
  if (/order/.test(n) && /(place|submit|create|new|cancel|modify|replace)/.test(n))
    return true;
  return false;
}

// Best-effort notional ($) estimate from common arg shapes. null = unknown.
export function estimateNotionalUsd(args: Record<string, unknown>): number | null {
  const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
  for (const k of ["notional", "amount", "amount_usd", "dollar_amount", "dollars", "value", "cost"]) {
    const v = num(args[k]);
    if (v != null) return v;
  }
  const qty = num(args.quantity) ?? num(args.qty) ?? num(args.shares);
  const px =
    num(args.price) ?? num(args.limit_price) ?? num(args.limitPrice) ?? num(args.stop_price);
  if (qty != null && px != null) return qty * px;
  return null;
}

export interface PolicyDecision {
  allow: boolean;
  mutating: boolean;
  reason?: string;
}

// Decide whether a tool call may execute. `ordersSoFar` is the count of mutating
// calls already executed in the current run (for the per-run cap).
export function evaluateToolCall(
  name: string,
  args: Record<string, unknown>,
  ordersSoFar: number,
): PolicyDecision {
  const mutating = isMutatingTool(name);
  if (!mutating) return { allow: true, mutating: false };

  const mode = tradingMode();
  if (mode === "advisory") {
    return { allow: false, mutating, reason: "advisory mode — order execution disabled (set TRADING_MODE=auto)" };
  }
  if (mode === "confirm") {
    return { allow: false, mutating, reason: "confirm mode — orders require explicit human approval via /api/trading, not the autonomous loop" };
  }

  // auto — apply hard caps
  const maxOrders = maxOrdersPerRun();
  if (ordersSoFar >= maxOrders) {
    return { allow: false, mutating, reason: `per-run order cap reached (${maxOrders})` };
  }
  const notional = estimateNotionalUsd(args);
  const cap = maxOrderUsd();
  if (notional != null && notional > cap) {
    return { allow: false, mutating, reason: `order ~$${notional.toFixed(2)} exceeds cap $${cap}` };
  }
  return { allow: true, mutating };
}
