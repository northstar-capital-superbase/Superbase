import { NextResponse } from "next/server";
import { getMemory } from "@/lib/memory";
import type { MemoryKind } from "@/lib/memory/types";

export const runtime = "nodejs";

const KINDS: MemoryKind[] = ["message", "agent_output", "fact", "plan"];

// GET /api/memory?sessionId=...[&kind=&author=&q=&limit=]
// Reads recent shared memory, optionally filtered by kind, author, and a
// case-insensitive content substring — backs both the live tail and the
// Memory Explorer. Filtering runs server-side so it works on either backend.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "default";
  const limit = Math.min(Number(searchParams.get("limit") ?? "50") || 50, 500);
  const kindParam = searchParams.get("kind");
  const author = (searchParams.get("author") ?? "").trim().toLowerCase();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const kinds =
    kindParam && KINDS.includes(kindParam as MemoryKind)
      ? [kindParam as MemoryKind]
      : undefined;

  const window = await getMemory().recent({ sessionId, kinds, limit });
  const entries = window.filter(
    (e) =>
      (!author || e.author.toLowerCase() === author) &&
      (!q || e.content.toLowerCase().includes(q)),
  );
  return NextResponse.json({ entries, total: window.length, shown: entries.length });
}

// DELETE /api/memory?sessionId=...            — wipe a session's shared memory
// DELETE /api/memory?sessionId=...&id=<entry> — forget a single entry
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "default";
  const id = searchParams.get("id");

  if (id) {
    const removed = await getMemory().remove(sessionId, id);
    return NextResponse.json({ ok: removed, removed });
  }

  await getMemory().clear(sessionId);
  return NextResponse.json({ ok: true });
}
