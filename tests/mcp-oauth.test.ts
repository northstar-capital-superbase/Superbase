import { describe, it, expect } from "vitest";
import {
  buildAuthorizeUrl,
  generatePkce,
  ROBINHOOD_OAUTH,
} from "@/lib/mcp/oauth";
import { createHash } from "crypto";

describe("generatePkce", () => {
  it("produces a valid S256 challenge for the verifier", () => {
    const { verifier, challenge } = generatePkce();
    expect(verifier.length).toBeGreaterThan(40);
    const expected = createHash("sha256")
      .update(verifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    expect(challenge).toBe(expected);
  });
});

describe("buildAuthorizeUrl", () => {
  it("includes required OAuth parameters", () => {
    const url = buildAuthorizeUrl({
      clientId: "test-client",
      redirectUri: "http://localhost:3000/api/trading/oauth/callback",
      codeChallenge: "challenge123",
      state: "state456",
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      ROBINHOOD_OAUTH.authorizationEndpoint,
    );
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("test-client");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/trading/oauth/callback",
    );
    expect(parsed.searchParams.get("scope")).toBe("internal");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("state")).toBe("state456");
  });
});
