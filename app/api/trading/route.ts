import { NextResponse } from "next/server";
import { getMcpClient, mcpEnabled, evaluateToolCall } from "@/lib/mcp";
import { clientKey, rateLimit } from "@/lib/guardrails";

export const runtime = "nodejs";

// GET /api/trading          → static status (token configured, yes/no)
// GET /api/trading?probe=1  → fires a live MCP round-trip: initialize + tools/list
// POST /api/trading/tools   → returns the cached tool list
// POST /api/trading/call    → { tool, args } → proxies to Robinhood MCP tools/call
//
// This endpoint keeps the MCP token server-side (Next.js server component /
// API-only) so it is never sent to the browser.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const probe = searchParams.get("probe") === "1";

  const enabled = mcpEnabled();
  const base = { enabled, endpoint: "https://agent.robinhood.com/mcp/trading" };

  if (!probe) {
    return NextResponse.json({ ok: true, ...base });
  }

  if (!enabled) {
    return NextResponse.json(
      {
        ok: false,
        ...base,
        error: "ROBINHOOD_MCP_TOKEN is not configured",
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
      { error: "ROBINHOOD_MCP_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const client = getMcpClient()!;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

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
