import { mcpEnabled } from "./index";

// The Robinhood token is currently deployment-global. Until credentials are
// stored per user, access must be explicitly restricted to known account
// owners; merely being signed in is not sufficient authorization.
export function tradingAllowedFor(email: string | null | undefined): boolean {
  if (!mcpEnabled() || !email) return false;

  const allowed = (process.env.TRADING_ALLOWED_USER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.toLowerCase());
}
