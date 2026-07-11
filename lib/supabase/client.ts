"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Browser-side Supabase client for Auth (sign in/up/out, session restore) and
// direct, RLS-protected reads/writes of the caller's own rows (e.g. their
// profile). Never used to bypass ownership checks — RLS enforces that even
// if this client is used directly.
export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase Auth is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(env.url, env.anonKey);
}
