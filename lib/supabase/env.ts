// Resolves Supabase Auth config from NEXT_PUBLIC_* env vars. These are safe
// to inline at build time (URL + anon key are public by design — RLS is what
// actually protects data), so this same helper works in the browser, Server
// Components, Route Handlers, and middleware.
export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseAuthConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
