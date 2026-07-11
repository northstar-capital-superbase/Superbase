import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthedUser {
  id: string;
  email: string | null;
  // The caller's raw JWT, for constructing per-request, RLS-scoped clients
  // (e.g. lib/memory's Supabase store) — never a client-supplied id.
  accessToken: string;
}

// Resolves the authenticated user directly from the request's session
// cookie via Supabase Auth. This is the ONLY source of identity for server
// code — routes must never trust a userId/sessionId sent by the client.
// Returns null when unauthenticated or when Supabase Auth isn't configured.
export async function getAuthedUser(): Promise<AuthedUser | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return null;

  return { id: userData.user.id, email: userData.user.email ?? null, accessToken };
}
