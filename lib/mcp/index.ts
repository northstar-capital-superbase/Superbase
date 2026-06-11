import { RobinhoodMcpClient } from "./client";
import type { IMcpClient } from "./types";
import { getRobinhoodMcpToken } from "./token";

export * from "./types";
export * from "./trading-policy";
export * from "./oauth";
export { getRobinhoodMcpToken, saveRobinhoodMcpToken, robinhoodTokenFileName } from "./token";

let _injected: IMcpClient | null = null;
let _singleton: IMcpClient | null = null;
let _singletonToken: string | null = null;

export function getMcpClient(): IMcpClient | null {
  if (_injected) return _injected;

  const token = getRobinhoodMcpToken();
  if (!token) return null;

  if (_singleton && _singletonToken === token) return _singleton;

  _singleton = new RobinhoodMcpClient(token);
  _singletonToken = token;
  return _singleton;
}

export function mcpEnabled(): boolean {
  return Boolean(getRobinhoodMcpToken());
}

// Swap the client — useful for tests.
export function setMcpClient(client: IMcpClient | null): void {
  _injected = client;
}

export function resetMcpClient(): void {
  _injected = null;
  _singleton = null;
  _singletonToken = null;
}
