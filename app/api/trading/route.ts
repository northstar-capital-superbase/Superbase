import { NextResponse } from "next/server";
import {
  getMcpClient,
  mcpEnabled,
  evaluateToolCall,
  maxOrderUsd,
  maxOrdersPerRun,
  tradingMode,
  tradingModeSource,
  setTradingModeOverride,
  type TradingMode,
} from "@/lib/mcp";
import { clientKey, rateLimit } from "@/lib/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/trading            → status (token configured, effective mode, caps)
// GET /api/trading?probe=1    → fires a live MCP round-trip: initialize + tools/list
// POST /api/trading?action=tools → returns the cached tool list
// POST /api/trading?action=call  → { tool, args } → proxies to Robinhood MCP tools/call
// POST /api/trading?action=mode  → { mode } → set the runtime mode / kill switch
//
// This endpoint keeps the MCP token server-side (Next.js server component /
// API-only) so it is never sent to the browser.

const MODES: TradingMode[] = ["advisory", "confirm", "auto"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const probe = searchParams.get("probe") === "1";

  const enabled = mcpEnabled();
  const base = {
    enabled,
    endpoint: "https://agent.robinhood.com/mcp/trading",
    mode: tradingMode(),
    modeSource: tradingModeSource(),
    maxOrderUsd: maxOrderUsd(),
    maxOrdersPerRun: maxOrdersPerRun(),
  };

  if (!probe) {
    return NextResponse.json({ ok: true, ...base });
  }

  if (!enabled) {
    return NextResponse.json(
      {
        ok: false,
        ...base,
        error:
          "ROBINHOOD_MCP_TOKEN is not configured — connect via GET /api/trading/oauth/start",
      },
      { status: 503 },
    );
  }

  const client = getMcpClient()!;
  const result = await client.probe();
  return NextResponse.json(
    { ...base, ...result },
    { status: result.ok ? 200 : 502 },
  );
}

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req), { limit: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded (${limit.limit}/min). Try again shortly.` },
      { status: 429 },
    );
  }

  if (!mcpEnabled()) {
    return NextResponse.json(
      {
        error:
          "ROBINHOOD_MCP_TOKEN is not configured — connect via GET /api/trading/oauth/start",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // POST /api/trading?action=mode — set the runtime trading mode (kill switch).
  // Setting "advisory" is the kill switch: it blocks every order mutation
  // instantly, without a redeploy. Enabling "auto" is a deliberate act that the
  // UI double-confirms; consider gating it behind step-up auth in production.
  if (action === "mode") {
    const body = (await req.json().catch(() => ({}))) as { mode?: unknown };
    const mode = MODES.find((m) => m === body.mode);
    if (!mode) {
      return NextResponse.json(
        { error: `Invalid mode. Use one of: ${MODES.join(", ")}` },
        { status: 400 },
      );
    }
    setTradingModeOverride(mode);
    return NextResponse.json({
      ok: true,
      mode: tradingMode(),
      modeSource: tradingModeSource(),
    });
  }

  const client = getMcpClient()!;

  // POST /api/trading?action=tools — list available tools.
  if (action === "tools") {
    try {
      const tools = await client.listTools();
      return NextResponse.json({ ok: true, tools });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 502 },
      );
    }
  }

  // POST /api/trading?action=call — execute a tool.
  if (action === "call") {
    const body = await req.json().catch(() => ({})) as {
      tool?: unknown;
      args?: unknown;
    };
    const tool = typeof body.tool === "string" ? body.tool : null;
    const args =
      body.args && typeof body.args === "object" && !Array.isArray(body.args)
        ? (body.args as Record<string, unknown>)
        : {};

    if (!tool) {
      return NextResponse.json(
        { error: "Missing required field: tool" },
        { status: 400 },
      );
    }

    // Enforce the trading policy here too (defense in depth): a manual proxy
    // call can't place an order the agent loop wouldn't be allowed to.
    const decision = evaluateToolCall(tool, args, 0);
    if (!decision.allow) {
      return NextResponse.json(
        { ok: false, error: `Blocked by trading policy: ${decision.reason}` },
        { status: 403 },
      );
    }

    try {
      const result = await client.callTool(tool, args);
      return NextResponse.json({ ok: !result.isError, result });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(
    { error: "Unknown action. Use ?action=tools or ?action=call" },
    { status: 400 },
  );
}
