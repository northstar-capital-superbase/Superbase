import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { memoryBackend } from "@/lib/memory";

export const runtime = "nodejs";

// GET /api/health        → static readiness (provider/model/memory, no API call)
// GET /api/health?ping=1 → also fires one minimal live completion to confirm the
//                          configured provider actually reaches the model. This
//                          is the integration self-test: on failure it returns
//                          the exact typed error (bad key, wrong model, etc.).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ping = searchParams.get("ping") === "1";

  const provider = getProvider();
  const base = {
    provider: provider.name,
    model: provider.model,
    memory: memoryBackend(),
    mock: provider.name === "mock",
  };

  if (!ping) {
    return NextResponse.json({ ok: true, ...base });
  }

  const started = Date.now();
  try {
    const res = await provider.complete({
      system: "You are a connectivity probe. Reply with exactly: OK",
      messages: [{ role: "user", content: "ping" }],
      maxTokens: 16,
    });
    return NextResponse.json({
      ok: true,
      live: provider.name !== "mock",
      reply: res.text.slice(0, 80),
      ms: Date.now() - started,
      ...base,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - started,
        ...base,
      },
      { status: 502 },
    );
  }
}
