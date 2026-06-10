import type { IMcpClient, McpCallResult, McpProbeResult, McpTool } from "./types";

const ROBINHOOD_MCP_URL = "https://agent.robinhood.com/mcp/trading";

// MCP client timeout — tool calls can be slow (market data fetch, order routing).
const TIMEOUT_MS = 15_000;

// Implements the MCP Streamable HTTP transport, targeting Robinhood's trading
// endpoint. Every request is a JSON-RPC 2.0 POST. The client caches the tool
// list to avoid redundant round-trips within a single agent turn.
export class RobinhoodMcpClient implements IMcpClient {
  private url: string;
  private token: string;
  private _cachedTools: McpTool[] | null = null;
  private _initialized = false;

  constructor(token: string, url = ROBINHOOD_MCP_URL) {
    this.token = token;
    this.url = url;
  }

  // Lazily initializes the MCP session (required by protocol before tool use).
  private async ensureInitialized(): Promise<void> {
    if (this._initialized) return;
    await this.rpc("initialize", {
      protocolVersion: "2024-11-05",
      clientInfo: { name: "northstar-labs", version: "0.1.0" },
      capabilities: { tools: {} },
    });
    await this.notify("notifications/initialized");
    this._initialized = true;
  }

  // Fire-and-forget JSON-RPC notification (no id, no result expected).
  private async notify(method: string): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  // JSON-RPC 2.0 POST with Bearer auth and a hard timeout.
  private async rpc(method: string, params?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          ...(params !== undefined ? { params } : {}),
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Robinhood MCP HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const contentType = res.headers.get("content-type") ?? "";

    // Streamable HTTP: server may return SSE — read the first `data:` line.
    if (contentType.includes("text/event-stream")) {
      return extractFirstSseData(await res.text());
    }

    const json = (await res.json()) as {
      result?: unknown;
      error?: { code: number; message: string };
    };
    if (json.error) {
      throw new Error(
        `Robinhood MCP error ${json.error.code}: ${json.error.message}`,
      );
    }
    return json.result;
  }

  async listTools(): Promise<McpTool[]> {
    if (this._cachedTools) return this._cachedTools;
    await this.ensureInitialized();
    const result = (await this.rpc("tools/list")) as { tools?: McpTool[] };
    this._cachedTools = result?.tools ?? [];
    return this._cachedTools;
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<McpCallResult> {
    await this.ensureInitialized();
    return (await this.rpc("tools/call", {
      name,
      arguments: args,
    })) as McpCallResult;
  }

  async probe(): Promise<McpProbeResult> {
    const started = Date.now();
    // Reset cache so the probe fires a real network request.
    this._cachedTools = null;
    this._initialized = false;
    try {
      const tools = await this.listTools();
      return { ok: true, ms: Date.now() - started, toolCount: tools.length };
    } catch (err) {
      return {
        ok: false,
        ms: Date.now() - started,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

// Parse a JSON payload from the first `data:` line of an SSE stream body.
function extractFirstSseData(body: string): unknown {
  for (const line of body.split("\n")) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("data:")) {
      const payload = trimmed.slice("data:".length).trim();
      if (payload && payload !== "[DONE]") {
        const wrapper = JSON.parse(payload) as {
          result?: unknown;
          error?: { code: number; message: string };
        };
        if (wrapper.error)
          throw new Error(
            `Robinhood MCP error ${wrapper.error.code}: ${wrapper.error.message}`,
          );
        return wrapper.result;
      }
    }
  }
  throw new Error("Robinhood MCP: no data in SSE response");
}
