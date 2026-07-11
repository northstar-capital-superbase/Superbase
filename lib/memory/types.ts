// Shared memory is the lab's connective tissue: every agent reads recent
// context before acting and writes its output back, so later agents build on
// earlier ones within (and across) runs.

export type MemoryKind = "message" | "agent_output" | "fact" | "plan";

export interface MemoryEntry {
  id: string;
  sessionId: string;
  // Owning authenticated user. Optional only for back-compat with rows
  // written before auth existed — every new write sets it from the
  // server-resolved session, never from client input.
  userId?: string | null;
  kind: MemoryKind;
  author: string; // agent id or "user"
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO
}

export interface MemoryQuery {
  sessionId: string;
  // When set, results are scoped to this user in addition to sessionId —
  // the isolation boundary between accounts.
  userId?: string | null;
  kinds?: MemoryKind[];
  limit?: number;
}

export interface MemoryStore {
  append(entry: Omit<MemoryEntry, "id" | "createdAt">): Promise<MemoryEntry>;
  recent(query: MemoryQuery): Promise<MemoryEntry[]>;
  clear(sessionId: string, userId?: string | null): Promise<void>;
}
