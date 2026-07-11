import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildAuthorizeUrl,
  generatePkce,
  registerOAuthClient,
} from "@/lib/mcp/oauth";
import { getAuthedUser } from "@/lib/auth/getUser";
import { tradingAllowedFor } from "@/lib/mcp/access";

export const runtime = "nodejs";

const COOKIE = "rh_oauth_pkce";
const COOKIE_MAX_AGE = 600;

function callbackUrl(req: Request): string {
  const url = new URL(req.url);
  return `${url.origin}/api/trading/oauth/callback`;
}

// GET /api/trading/oauth/start — begin Robinhood MCP OAuth (PKCE + DCR).
export async function GET(req: Request) {
  const user = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!tradingAllowedFor(user.email)) {
    return NextResponse.json(
      { error: "This account is not authorized to connect Robinhood." },
      { status: 403 },
    );
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Robinhood OAuth is disabled in production until encrypted per-user token storage is configured.",
      },
      { status: 503 },
    );
  }

  try {
    const redirectUri = callbackUrl(req);
    const pkce = generatePkce();
    const { clientId } = await registerOAuthClient(redirectUri);
    const state = crypto.randomUUID();

    const payload = JSON.stringify({
      verifier: pkce.verifier,
      redirectUri,
      clientId,
      state,
    });

    cookies().set(COOKIE, payload, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    const authorize = buildAuthorizeUrl({
      clientId,
      redirectUri,
      codeChallenge: pkce.challenge,
      state,
    });

    return NextResponse.redirect(authorize);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to start Robinhood OAuth",
        detail: message,
        hint: "Complete auth on desktop. See docs/TRADING.md",
      },
      { status: 502 },
    );
  }
}
