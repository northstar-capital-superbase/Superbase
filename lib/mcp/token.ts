import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TOKEN_FILE = ".robinhood-mcp-token";

/** Resolve the Robinhood MCP bearer token (env wins, then local dev file). */
export function getRobinhoodMcpToken(): string | null {
  const fromEnv = process.env.ROBINHOOD_MCP_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    return null;
  }

  try {
    const path = join(process.cwd(), TOKEN_FILE);
    if (!existsSync(path)) return null;
    const token = readFileSync(path, "utf8").trim();
    return token || null;
  } catch {
    return null;
  }
}

/** Persist token for local dev (picked up without editing `.env.local`). */
export function saveRobinhoodMcpToken(token: string): void {
  const path = join(process.cwd(), TOKEN_FILE);
  writeFileSync(path, `${token.trim()}\n`, { mode: 0o600 });
}

export function robinhoodTokenFileName(): string {
  return TOKEN_FILE;
}
