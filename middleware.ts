import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { isAuthBypassEnabled } from "@/lib/auth/devBypass";

// Route protection for every private OS surface. Unauthenticated visitors to
// a protected page are sent to /login (with a `redirect` back-link);
// authenticated visitors to /login are sent straight into the OS. Fails
// closed — if Supabase Auth isn't configured, `user` is always null, so
// protected routes stay inaccessible rather than silently opening up.
const PROTECTED_PREFIXES = ["/labs", "/settings", "/connections"];
const AUTH_ROUTES = ["/login"];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function redirectWithSessionCookies(
  url: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies
    .getAll()
    .forEach(({ name, value, ...options }) => redirect.cookies.set(name, value, options));
  return redirect;
}

export async function middleware(request: NextRequest) {
  // Development auth bypass: explicit opt-in only (NORTHSTAR_DEV_NO_AUTH=1),
  // and it refuses to activate in a real Vercel Production deployment — see
  // lib/auth/devBypass.ts for the full safety contract. When active, every
  // route (including /login) is let through untouched; the real session
  // refresh + redirect logic below is completely skipped, not weakened, and
  // resumes normal operation the instant the flag is removed.
  if (isAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (matches(pathname, PROTECTED_PREFIXES) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", pathname);
    return redirectWithSessionCookies(url, response);
  }

  if (matches(pathname, AUTH_ROUTES) && user) {
    const url = request.nextUrl.clone();
    url.pathname = safeRedirectPath(request.nextUrl.searchParams.get("redirect"));
    url.search = "";
    return redirectWithSessionCookies(url, response);
  }

  return response;
}

// Scoped to page navigations only — API routes resolve identity themselves
// (via lib/auth/getUser.ts) and return JSON 401s instead of HTML redirects.
export const config = {
  matcher: ["/labs/:path*", "/settings/:path*", "/connections/:path*", "/login"],
};
