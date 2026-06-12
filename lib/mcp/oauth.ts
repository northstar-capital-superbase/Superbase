import { createHash, randomBytes } from "crypto";

export const ROBINHOOD_MCP_URL = "https://agent.robinhood.com/mcp/trading";

export const ROBINHOOD_OAUTH = {
  authorizationEndpoint: "https://robinhood.com/oauth",
  tokenEndpoint: "https://api.robinhood.com/oauth2/token/",
  registrationEndpoint: "https://agent.robinhood.com/oauth/trading/register",
  scope: "internal",
} as const;

export interface PkcePair {
  verifier: string;
  challenge: string;
}

export function generatePkce(): PkcePair {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(
    createHash("sha256").update(verifier).digest(),
  );
  return { verifier, challenge };
}

export async function registerOAuthClient(
  redirectUri: string,
): Promise<{ clientId: string; redirectUri: string }> {
  const res = await fetch(ROBINHOOD_OAUTH.registrationEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Northstar Labs",
      redirect_uris: [redirectUri],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Robinhood client registration failed (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as {
    client_id?: string;
    redirect_uris?: string[];
  };
  if (!json.client_id) {
    throw new Error("Robinhood client registration returned no client_id");
  }

  return {
    clientId: json.client_id,
    redirectUri: json.redirect_uris?.[0] ?? redirectUri,
  };
}

export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    scope: ROBINHOOD_OAUTH.scope,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
    state: opts.state,
  });
  return `${ROBINHOOD_OAUTH.authorizationEndpoint}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(opts: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: opts.clientId,
    code_verifier: opts.codeVerifier,
  });

  const res = await fetch(ROBINHOOD_OAUTH.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.access_token) {
    const detail =
      json.error_description ?? json.error ?? `HTTP ${res.status}`;
    throw new Error(`Robinhood token exchange failed: ${detail}`);
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
