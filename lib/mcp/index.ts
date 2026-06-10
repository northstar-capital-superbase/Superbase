import { RobinhoodMcpClient } from "./client";
import type { IMcpClient } from "./types";

export * from "./types";

// Lazily-constructed singleton — avoids instantiating the client (and burning
// a network request) when the token is absent (e.g. in mock/dev mode).
let _client: IMcpClient | null = null;

export function getMcpClient(): IMcpClient | null {
  // If a client was explicitly injected (e.g. in tests), return it regardless
  // of whether the token env var is present.
  if (_client) return _client;
  const token = process.env.ROBINHOOD_MCP_TOKEN;
  if (!token) return null;
  _client = new RobinhoodMcpClient(token);
  return _client;
}

export function mcpEnabled(): boolean {
  return Boolean(process.env.ROBINHOOD_MCP_TOKEN);
}

// Swap the singleton — useful for tests.
export function setMcpClient(client: IMcpClient | null): void {
  _client = client;
}
