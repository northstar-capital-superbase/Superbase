// MCP (Model Context Protocol) types — JSON-RPC 2.0 over Streamable HTTP.
// Based on the Anthropic MCP specification (https://modelcontextprotocol.io).

export interface McpToolInputSchema {
  type: "object";
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
}

export type McpContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: "resource"; resource: { uri: string; text?: string } };

export interface McpCallResult {
  content: McpContentBlock[];
  isError?: boolean;
}

export interface McpProbeResult {
  ok: boolean;
  ms: number;
  toolCount?: number;
  error?: string;
}

export interface IMcpClient {
  listTools(): Promise<McpTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult>;
  probe(): Promise<McpProbeResult>;
}
