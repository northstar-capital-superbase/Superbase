import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// Refreshes the Supabase session cookie on every middleware-matched request
// and resolves the authenticated user (or null). Route protection decisions
// live in the root middleware.ts, which calls this first — the refresh MUST
// happen before any redirect so a valid session never gets silently dropped.
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  const response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) return { response, user: null };

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Revalidates the JWT against Supabase Auth (not just decoding the
  // cookie) — this is the one call that must run before any route decision.
  const { data } = await supabase.auth.getUser();
  return { response, user: data.user ?? null };
}
