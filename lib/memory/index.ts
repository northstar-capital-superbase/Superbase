import { InMemoryStore } from "./in-memory-store";
import { SupabaseStore } from "./supabase-store";
import type { MemoryStore } from "./types";

export * from "./types";

let cached: MemoryStore | null = null;

// Resolve Supabase config from server-runtime env. We deliberately prefer the
// non-public names (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) because the memory
// store is server-only: Next.js inlines NEXT_PUBLIC_* at BUILD time, so those
// would freeze to their build-time (often empty) values under `next start`.
// Bracket access on the NEXT_PUBLIC_* fallbacks avoids that static inlining so
// they're still read at runtime for anyone who set them.
function supabaseConfig(): { url?: string; key?: string } {
  const url = process.env.SUPABASE_URL || process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  return { url, key };
}

// Uses Supabase when configured, otherwise falls back to the in-process store.
export function getMemory(): MemoryStore {
  if (cached) return cached;

  const { url, key } = supabaseConfig();
  cached = url && key ? new SupabaseStore(url, key) : new InMemoryStore();
  return cached;
}

export function memoryBackend(): "supabase" | "in-memory" {
  const { url, key } = supabaseConfig();
  return url && key ? "supabase" : "in-memory";
}
