import { NextResponse } from "next/server";
import { getMemory } from "@/lib/memory";

export const runtime = "nodejs";

// GET /api/memory?sessionId=... — read recent shared memory.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "default";
  const limit = Number(searchParams.get("limit") ?? "50");
  const entries = await getMemory().recent({ sessionId, limit });
  return NextResponse.json({ entries });
}

// DELETE /api/memory?sessionId=... — wipe a session's shared memory.
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "default";
  await getMemory().clear(sessionId);
  return NextResponse.json({ ok: true });
}
