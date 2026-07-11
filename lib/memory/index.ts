import { InMemoryStore } from "./in-memory-store";
import { SupabaseStore } from "./supabase-store";
import type { MemoryStore } from "./types";

export * from "./types";

// Cache the store on globalThis rather than a module-local. Next.js bundles each
// route handler separately, so a plain module-level singleton is instantiated
// once *per route* — meaning writes from /api/chat land in a different
// InMemoryStore than the one /api/memory reads from, and shared memory always
// looks empty. A globalThis cache is shared across every route bundle in the
// same Node process, so the in-memory backend actually persists across requests.
const globalForMemory = globalThis as unknown as {
  __northstarMemory?: MemoryStore;
};

// Resolve Supabase config from server-runtime env. We deliberately prefer the
// non-public names (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) because the memory
// store is server-only: Next.js inlines NEXT_PUBLIC_* at BUILD time, so those
// would freeze to their build-time (often empty) values under `next start`.
// Bracket access on the NEXT_PUBLIC_* fallbacks avoids that static inlining so
// they're still read at runtime for anyone who set them.
function supabaseConfig(): { url?: string; anonKey?: string; adminKey?: string } {
  const url = process.env.SUPABASE_URL || process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
  return { url, anonKey, adminKey };
}

// Uses Supabase when configured, otherwise falls back to the in-process store.
//
// Pass `accessToken` (the caller's own session JWT, resolved server-side via
// lib/auth/getUser.ts — never a client-supplied id) for every user-owned
// read/write. That authenticates the underlying Supabase request AS that
// user, so Postgres RLS enforces the per-user boundary directly — the
// strongest guarantee available, independent of application-level filters.
// A fresh client is created per call in that case (identity changes per
// request); the unauthenticated path keeps the process-wide singleton used
// by diagnostics (e.g. /api/health?memory=1).
export function getMemory(opts?: { accessToken?: string }): MemoryStore {
  const { url, anonKey, adminKey } = supabaseConfig();

  if (opts?.accessToken && url && anonKey) {
    return new SupabaseStore(url, anonKey, opts.accessToken);
  }

  if (globalForMemory.__northstarMemory) return globalForMemory.__northstarMemory;
  globalForMemory.__northstarMemory =
    url && adminKey ? new SupabaseStore(url, adminKey) : new InMemoryStore();
  return globalForMemory.__northstarMemory;
}

export function memoryBackend(): "supabase" | "in-memory" {
  const { url, adminKey } = supabaseConfig();
  return url && adminKey ? "supabase" : "in-memory";
}
