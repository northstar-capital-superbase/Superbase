import { NextResponse } from "next/server";
import { runCrew } from "@/lib/orchestration/crew";
import { clientKey, rateLimit, validateTask } from "@/lib/guardrails";
import { getAuthedUser } from "@/lib/auth/getUser";

export const runtime = "nodejs";

// POST /api/chat — runs the full multi-agent workflow for one user message.
// Identity is resolved server-side from the session cookie; every memory
// read/write for this run is bound to that user, never to a client-sent id.
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const limit = rateLimit(clientKey(req));
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded (${limit.limit}/min). Try again shortly.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const valid = validateTask(body?.task ?? body?.message);
    if ("error" in valid) {
      return NextResponse.json({ error: valid.error }, { status: 400 });
    }
    const sessionId = (body?.sessionId ?? "default").toString();
    const specialists = Array.isArray(body?.specialists)
      ? body.specialists
      : undefined;

    const run = await runCrew({
      sessionId,
      task: valid.task,
      specialists,
      userId: user.id,
      accessToken: user.accessToken,
    });
    return NextResponse.json(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
