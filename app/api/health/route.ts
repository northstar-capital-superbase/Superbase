import { NextResponse } from "next/server";
import { getProviderSafe } from "@/lib/llm";
import { getMemory, memoryBackend } from "@/lib/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health         → static readiness (provider/model/memory, no I/O)
// GET /api/health?ping=1   → also fires one minimal live completion to confirm
//                            the configured provider reaches the model.
// GET /api/health?memory=1 → also runs a write→read→clear roundtrip against the
//                            memory store. For Supabase this confirms the URL,
//                            key, AND that the `lab_memory` table exists — any
//                            failure returns the exact error (bad key, missing
//                            table, unreachable host).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ping = searchParams.get("ping") === "1";
  const memoryCheck = searchParams.get("memory") === "1";

  const provider = getProviderSafe();
  const backend = memoryBackend();
  const base = {
    provider: provider?.name ?? null,
    model: provider?.model ?? null,
    memory: backend,
    configured: provider !== null,
  };

  if (memoryCheck) {
    return NextResponse.json(...(await probeMemory(base)));
  }

  if (!ping) {
    return NextResponse.json({ ok: base.configured, ...base });
  }

  if (!provider) {
    return NextResponse.json(
      {
        ok: false,
        error: "No LLM provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.",
        ...base,
      },
      { status: 503 },
    );
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
      live: true,
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

// Write→read→clear roundtrip against the active memory store.
async function probeMemory(
  base: Record<string, unknown>,
): Promise<[Record<string, unknown>, { status: number }?]> {
  const started = Date.now();
  const sessionId = `__healthcheck_${Date.now()}`;
  try {
    const memory = getMemory();
    const written = await memory.append({
      sessionId,
      kind: "fact",
      author: "healthcheck",
      content: "supabase connectivity probe",
    });
    const back = await memory.recent({ sessionId, limit: 1 });
    await memory.clear(sessionId);

    const roundTripped = back.some((e) => e.id === written.id);
    return [
      {
        ok: roundTripped,
        backend: base.memory,
        persisted: base.memory === "supabase",
        ms: Date.now() - started,
        ...base,
        ...(roundTripped ? {} : { error: "write succeeded but read-back missed" }),
      },
      roundTripped ? undefined : { status: 502 },
    ];
  } catch (err) {
    return [
      {
        ok: false,
        backend: base.memory,
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - started,
        ...base,
      },
      { status: 502 },
    ];
  }
}
