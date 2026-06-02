import { InMemoryStore } from "./in-memory-store";
import { SupabaseStore } from "./supabase-store";
import type { MemoryStore } from "./types";

export * from "./types";

let cached: MemoryStore | null = null;

// Uses Supabase when configured, otherwise falls back to the in-process store.
export function getMemory(): MemoryStore {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    cached = new SupabaseStore(url, key);
  } else {
    cached = new InMemoryStore();
  }
  return cached;
}

export function memoryBackend(): "supabase" | "in-memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? "supabase"
    : "in-memory";
}
