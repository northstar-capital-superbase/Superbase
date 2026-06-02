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
    const { sessionId, kinds, limit = 50 } = query;
    return this.entries
      .filter((e) => e.sessionId === sessionId)
      .filter((e) => !kinds || kinds.includes(e.kind))
      .slice(-limit);
  }

  async clear(sessionId: string): Promise<void> {
    this.entries = this.entries.filter((e) => e.sessionId !== sessionId);
  }
}
