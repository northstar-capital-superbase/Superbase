// Shared memory is the lab's connective tissue: every agent reads recent
// context before acting and writes its output back, so later agents build on
// earlier ones within (and across) runs.

export type MemoryKind = "message" | "agent_output" | "fact" | "plan";

export interface MemoryEntry {
  id: string;
  sessionId: string;
  kind: MemoryKind;
  author: string; // agent id or "user"
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO
}

export interface MemoryQuery {
  sessionId: string;
  kinds?: MemoryKind[];
  limit?: number;
}

export interface MemoryStore {
  append(entry: Omit<MemoryEntry, "id" | "createdAt">): Promise<MemoryEntry>;
  recent(query: MemoryQuery): Promise<MemoryEntry[]>;
  // Forget a single entry (granular right-to-be-forgotten). Returns true if an
  // entry was removed. Scoped to the session so ids can't cross sessions.
  remove(sessionId: string, id: string): Promise<boolean>;
  clear(sessionId: string): Promise<void>;
}
