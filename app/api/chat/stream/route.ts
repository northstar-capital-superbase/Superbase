import { streamCrew } from "@/lib/orchestration/crew";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/chat/stream — runs the multi-agent workflow and streams each step
// as Server-Sent Events (`data: <json CrewEvent>\n\n`), so the dashboard can
// light up agents and fill the memory tail in real time.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const task = (body?.task ?? body?.message ?? "").toString().trim();
  const sessionId = (body?.sessionId ?? "default").toString();
  const specialists = Array.isArray(body?.specialists) ? body.specialists : undefined;

  if (!task) {
    return new Response(JSON.stringify({ error: "Missing task/message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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
