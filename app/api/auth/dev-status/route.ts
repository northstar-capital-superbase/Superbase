import { NextResponse } from "next/server";
import { isAuthBypassEnabled } from "@/lib/auth/devBypass";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/dev-status — presentation-only probe so the client can render
// the mandatory persistent banner while the development auth bypass is
// active. The actual access-control decision is made server-side in
// middleware.ts and lib/auth/getUser.ts, both of which call the exact same
// isAuthBypassEnabled() — this route never grants or denies anything itself.
export async function GET() {
  return NextResponse.json(
    { bypassActive: isAuthBypassEnabled() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
