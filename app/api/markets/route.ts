import { NextResponse } from "next/server";
import { getMarketsSource, marketsBackend } from "@/lib/integrations/markets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/markets — read-only portfolio snapshot from the active markets source
// (mock until a brokerage adapter is configured). No write/trade operations are
// exposed here; order execution is a separate, human-approved path.
export async function GET() {
  try {
    const portfolio = await getMarketsSource().getPortfolio();
    return NextResponse.json({ backend: marketsBackend(), portfolio });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
