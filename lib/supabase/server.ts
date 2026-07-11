import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Server Component / Route Handler client bound to the request's session
// cookie. This is how every server-side identity check resolves the caller
// — never from a client-supplied id. Returns null when Supabase Auth isn't
// configured, so callers can fail closed (no session ⇒ no access).
export function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Thrown when called from a Server Component render (cookies are
          // read-only there). middleware.ts refreshes the session on every
          // navigation, so this is safe to ignore.
        }
      },
    },
  });
}
