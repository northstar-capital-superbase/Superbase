import { NextResponse, type NextRequest } from "next/server";
import { authenticate, AUTH_HEADERS } from "@/lib/auth";

// Central authentication gate for the protected API routes (issue #17).
// Validates the caller once, rejects unauthenticated requests with 401, and
// forwards the validated identity to the route handler via trusted headers
// (stripping any client-supplied copies first to prevent spoofing).
export async function middleware(req: NextRequest) {
  const principal = await authenticate(req);
  if (!principal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headers = new Headers(req.headers);
  headers.delete(AUTH_HEADERS.userId);
  headers.delete(AUTH_HEADERS.email);
  headers.delete(AUTH_HEADERS.kind);
  headers.set(AUTH_HEADERS.userId, principal.userId);
  if (principal.email) headers.set(AUTH_HEADERS.email, principal.email);
  headers.set(AUTH_HEADERS.kind, principal.kind);

  return NextResponse.next({ request: { headers } });
}

// Gate the run + memory + roster endpoints. /api/health stays public (load
// balancers), and /api/trading keeps its own OAuth flow.
export const config = {
  matcher: [
    "/api/chat",
    "/api/chat/:path*",
    "/api/memory",
    "/api/memory/:path*",
    "/api/agents",
    "/api/agents/:path*",
  ],
};
