import { streamCrew } from "@/lib/orchestration/crew";
import { clientKey, rateLimit, validateTask } from "@/lib/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status: number, headers?: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

// POST /api/chat/stream — runs the multi-agent workflow and streams each step
// as Server-Sent Events (`data: <json CrewEvent>\n\n`), so the dashboard can
// light up agents and fill the memory tail in real time.
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req));
  if (!limit.allowed) {
    return json(
      { error: `Rate limit exceeded (${limit.limit}/min). Try again shortly.` },
      429,
      { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
    );
  }

  const body = await req.json().catch(() => ({}));
  const valid = validateTask(body?.task ?? body?.message);
  if ("error" in valid) return json({ error: valid.error }, 400);
  const task = valid.task;
  const sessionId = (body?.sessionId ?? "default").toString();
  const specialists = Array.isArray(body?.specialists) ? body.specialists : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        for await (const event of streamCrew({ sessionId, task, specialists })) {
          send(event);
        }
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
