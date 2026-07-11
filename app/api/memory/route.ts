import { NextResponse } from "next/server";
import { getMemory } from "@/lib/memory";
import type { MemoryKind } from "@/lib/memory/types";
import { getAuthedUser } from "@/lib/auth/getUser";

export const runtime = "nodejs";

const KINDS: MemoryKind[] = ["message", "agent_output", "fact", "plan"];

// GET /api/memory?sessionId=...[&kind=&author=&q=&limit=]
// Reads recent shared memory, optionally filtered by kind, author, and a
// case-insensitive content substring — backs both the live tail and the
// Memory Explorer. Filtering runs server-side so it works on either backend.
// Scoped to the authenticated caller: a sessionId alone is no longer enough
// to read another user's memory, even if guessed.
export async function GET(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

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

  const memory = getMemory({ accessToken: user.accessToken });
  const window = await memory.recent({ sessionId, userId: user.id, kinds, limit });
  const entries = window.filter(
    (e) =>
      (!author || e.author.toLowerCase() === author) &&
      (!q || e.content.toLowerCase().includes(q)),
  );
  return NextResponse.json(
    { entries, total: window.length, shown: entries.length },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

// DELETE /api/memory?sessionId=... — wipe a session's shared memory. Scoped
// to the authenticated caller's own rows only.
export async function DELETE(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "default";
  const memory = getMemory({ accessToken: user.accessToken });
  await memory.clear(sessionId, user.id);
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
