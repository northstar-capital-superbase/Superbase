import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeAuthorizationCode,
  resetMcpClient,
  saveRobinhoodMcpToken,
} from "@/lib/mcp";

export const runtime = "nodejs";

const COOKIE = "rh_oauth_pkce";

interface OAuthCookie {
  verifier: string;
  redirectUri: string;
  clientId: string;
  state: string;
}

// GET /api/trading/oauth/callback — exchange code for MCP bearer token.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    return htmlResponse(
      "Robinhood OAuth failed",
      `<p><strong>${escapeHtml(error)}</strong></p>
       ${errorDescription ? `<p>${escapeHtml(errorDescription)}</p>` : ""}
       <p>Try again from <a href="/labs">/labs</a> → Integrations → Connect Robinhood.</p>
       <p>Robinhood requires desktop for Agentic account setup.</p>`,
      400,
    );
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const raw = cookies().get(COOKIE)?.value;

  if (!code || !raw) {
    return htmlResponse(
      "OAuth session expired",
      `<p>Missing authorization code or session cookie.</p>
       <p><a href="/api/trading/oauth/start">Restart Robinhood connect</a></p>`,
      400,
    );
  }

  let session: OAuthCookie;
  try {
    session = JSON.parse(raw) as OAuthCookie;
  } catch {
    return htmlResponse(
      "OAuth session invalid",
      `<p>Could not read OAuth session. <a href="/api/trading/oauth/start">Try again</a></p>`,
      400,
    );
  }

  if (!state || state !== session.state) {
    return htmlResponse(
      "OAuth state mismatch",
      `<p>Possible CSRF — please <a href="/api/trading/oauth/start">restart connect</a>.</p>`,
      400,
    );
  }

  cookies().delete(COOKIE);

  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      clientId: session.clientId,
      redirectUri: session.redirectUri,
      codeVerifier: session.verifier,
    });

    const isLocalDev =
      process.env.NODE_ENV !== "production" || !process.env.VERCEL;

    if (isLocalDev) {
      saveRobinhoodMcpToken(tokens.accessToken);
      resetMcpClient();
      return NextResponse.redirect(new URL("/labs?rh_connected=1", req.url));
    }

    return htmlResponse(
      "Robinhood connected",
      `<p>OAuth succeeded. Add this bearer token to your deploy environment:</p>
       <pre style="word-break:break-all;white-space:pre-wrap;background:#111;padding:1rem;border-radius:8px">${escapeHtml(tokens.accessToken)}</pre>
       <p>Set <code>ROBINHOOD_MCP_TOKEN</code> in Vercel (or your host), redeploy, then probe:</p>
       <pre>curl "https://your-app/api/trading?probe=1"</pre>
       <p><a href="/labs">Back to /labs</a></p>`,
      200,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return htmlResponse(
      "Token exchange failed",
      `<p>${escapeHtml(message)}</p>
       <p><a href="/api/trading/oauth/start">Restart Robinhood connect</a></p>`,
      502,
    );
  }
}

function htmlResponse(title: string, body: string, status: number): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Northstar Labs</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #e2e8f0; background: #0f172a; }
    a { color: #22d3ee; }
    code, pre { font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
