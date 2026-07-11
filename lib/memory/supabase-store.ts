import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MemoryEntry, MemoryQuery, MemoryStore } from "./types";

// Supabase-backed shared memory for persistence across processes/sessions.
// Table schema lives in `supabase/schema.sql`.
//
// When constructed with an `accessToken` (the caller's own Supabase session
// JWT), every request is sent as that authenticated user — so Postgres Row
// Level Security enforces the per-user boundary, not just this class's own
// filtering. That is the preferred path for all user-owned memory. Without a
// token, the store falls back to whatever key it was given (service role or
// anon) for admin/diagnostic use (e.g. the health check probe).
export class SupabaseStore implements MemoryStore {
  private client: SupabaseClient;
  private table = "lab_memory";

  constructor(url: string, key: string, accessToken?: string) {
    this.client = createClient(url, key, {
      auth: { persistSession: false },
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    });
  }

  async append(
    entry: Omit<MemoryEntry, "id" | "createdAt">,
  ): Promise<MemoryEntry> {
    const row = {
      session_id: entry.sessionId,
      user_id: entry.userId ?? null,
      kind: entry.kind,
      author: entry.author,
      content: entry.content,
      metadata: entry.metadata ?? {},
    };
    const { data, error } = await this.client
      .from(this.table)
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(`Supabase append failed: ${error.message}`);
    return rowToEntry(data);
  }

  async recent(query: MemoryQuery): Promise<MemoryEntry[]> {
    let q = this.client
      .from(this.table)
      .select("*")
      .eq("session_id", query.sessionId)
      .order("created_at", { ascending: false })
      .limit(query.limit ?? 50);
    if (query.userId !== undefined) q = q.eq("user_id", query.userId);
    if (query.kinds?.length) q = q.in("kind", query.kinds);

    const { data, error } = await q;
    if (error) throw new Error(`Supabase recent failed: ${error.message}`);
    return (data ?? []).map(rowToEntry).reverse();
  }

  async clear(sessionId: string, userId?: string | null): Promise<void> {
    let q = this.client.from(this.table).delete().eq("session_id", sessionId);
    if (userId !== undefined) q = q.eq("user_id", userId);
    const { error } = await q;
    if (error) throw new Error(`Supabase clear failed: ${error.message}`);
  }
}

function rowToEntry(row: any): MemoryEntry {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id ?? undefined,
    kind: row.kind,
    author: row.author,
    content: row.content,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}
