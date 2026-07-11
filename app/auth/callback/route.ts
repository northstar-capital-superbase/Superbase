import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /auth/callback — completes the PKCE code exchange for email
// confirmation and password-reset links (Supabase's emailRedirectTo target).
// A Route Handler, not a Server Component, because it needs to set the
// session cookie on the response.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");

  if (!code) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("auth_error", "invalid_callback");
    return NextResponse.redirect(login);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("auth_error", "not_configured");
    return NextResponse.redirect(login);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("auth_error", "callback_failed");
    return NextResponse.redirect(login);
  }

  const dest = type === "recovery" ? "/settings?section=auth" : "/labs";
  return NextResponse.redirect(new URL(dest, url.origin));
}
