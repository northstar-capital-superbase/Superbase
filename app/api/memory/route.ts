import { NextResponse } from "next/server";
import { getMemory } from "@/lib/memory";
import type { MemoryKind } from "@/lib/memory/types";
import { getPrincipal, unauthorized, scopeSession } from "@/lib/auth";

export const runtime = "nodejs";

const KINDS: MemoryKind[] = ["message", "agent_output", "fact", "plan"];

// GET /api/memory?sessionId=...[&kind=&author=&q=&limit=]
// Reads recent shared memory, optionally filtered by kind, author, and a
// case-insensitive content substring — backs both the live tail and the
// Memory Explorer. Filtering runs server-side so it works on either backend.
// Sessions are scoped to the authenticated user, so one user cannot read
// another's memory even with the same client-supplied sessionId.
export async function GET(req: Request) {
  const principal = await getPrincipal(req);
  if (!principal) return unauthorized();

  const { searchParams } = new URL(req.url);
  const clientSessionId = searchParams.get("sessionId") ?? "default";
  const sessionId = scopeSession(principal, clientSessionId);
  const limit = Math.min(Number(searchParams.get("limit") ?? "50") || 50, 500);
  const kindParam = searchParams.get("kind");
  const author = (searchParams.get("author") ?? "").trim().toLowerCase();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const kinds =
    kindParam && KINDS.includes(kindParam as MemoryKind)
      ? [kindParam as MemoryKind]
      : undefined;

  const window = await getMemory().recent({ sessionId, kinds, limit });
  const entries = window
    .filter(
      (e) =>
        (!author || e.author.toLowerCase() === author) &&
        (!q || e.content.toLowerCase().includes(q)),
    )
    // Hide the internal user-scoped prefix from the client.
    .map((e) => ({ ...e, sessionId: clientSessionId }));
  return NextResponse.json({ entries, total: window.length, shown: entries.length });
}

// DELETE /api/memory?sessionId=... — wipe the caller's session memory.
export async function DELETE(req: Request) {
  const principal = await getPrincipal(req);
  if (!principal) return unauthorized();

  const { searchParams } = new URL(req.url);
  const sessionId = scopeSession(principal, searchParams.get("sessionId") ?? "default");
  await getMemory().clear(sessionId);
  return NextResponse.json({ ok: true });
}
