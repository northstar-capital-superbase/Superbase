import { randomUUID } from "crypto";
import type { MemoryEntry, MemoryQuery, MemoryStore } from "./types";

// Process-local store. Survives across requests within one `next dev` process,
// which is all the local-first lab needs when Supabase isn't configured.
export class InMemoryStore implements MemoryStore {
  private entries: MemoryEntry[] = [];

  async append(
    entry: Omit<MemoryEntry, "id" | "createdAt">,
  ): Promise<MemoryEntry> {
    const full: MemoryEntry = {
      ...entry,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.entries.push(full);
    return full;
  }

  async recent(query: MemoryQuery): Promise<MemoryEntry[]> {
    const { sessionId, userId, kinds, limit = 50 } = query;
    return this.entries
      .filter((e) => e.sessionId === sessionId)
      // Isolation boundary for the default (no Supabase configured) backend:
      // a session owned by one user is invisible to every other user, even
      // on the same shared in-process store.
      .filter((e) => userId === undefined || (e.userId ?? null) === userId)
      .filter((e) => !kinds || kinds.includes(e.kind))
      .slice(-limit);
  }

  async clear(sessionId: string, userId?: string | null): Promise<void> {
    this.entries = this.entries.filter(
      (e) => !(e.sessionId === sessionId && (userId === undefined || (e.userId ?? null) === userId)),
    );
  }
}
