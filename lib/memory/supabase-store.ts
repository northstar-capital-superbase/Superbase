import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MemoryEntry, MemoryQuery, MemoryStore } from "./types";

// Supabase-backed shared memory for persistence across processes/sessions.
// Table schema lives in `supabase/schema.sql`.
export class SupabaseStore implements MemoryStore {
  private client: SupabaseClient;
  private table = "lab_memory";

  constructor(url: string, key: string) {
    this.client = createClient(url, key, { auth: { persistSession: false } });
  }

  async append(
    entry: Omit<MemoryEntry, "id" | "createdAt">,
  ): Promise<MemoryEntry> {
    const row = {
      session_id: entry.sessionId,
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
    if (query.kinds?.length) q = q.in("kind", query.kinds);

    const { data, error } = await q;
    if (error) throw new Error(`Supabase recent failed: ${error.message}`);
    return (data ?? []).map(rowToEntry).reverse();
  }

  async remove(sessionId: string, id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(this.table)
      .delete()
      .eq("session_id", sessionId)
      .eq("id", id)
      .select("id");
    if (error) throw new Error(`Supabase remove failed: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  async clear(sessionId: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq("session_id", sessionId);
    if (error) throw new Error(`Supabase clear failed: ${error.message}`);
  }
}

function rowToEntry(row: any): MemoryEntry {
  return {
    id: row.id,
    sessionId: row.session_id,
    kind: row.kind,
    author: row.author,
    content: row.content,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}
