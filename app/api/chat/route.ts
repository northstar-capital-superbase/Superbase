import { NextResponse } from "next/server";
import { runCrew } from "@/lib/orchestration/crew";

export const runtime = "nodejs";

// POST /api/chat — runs the full multi-agent workflow for one user message.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const task = (body?.task ?? body?.message ?? "").toString().trim();
    const sessionId = (body?.sessionId ?? "default").toString();
    const specialists = Array.isArray(body?.specialists)
      ? body.specialists
      : undefined;

    if (!task) {
      return NextResponse.json({ error: "Missing task/message" }, { status: 400 });
    }

    const run = await runCrew({ sessionId, task, specialists });
    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
