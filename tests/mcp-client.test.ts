import { describe, it, expect, vi, afterEach } from "vitest";
import { RobinhoodMcpClient } from "@/lib/mcp/client";

describe("RobinhoodMcpClient session handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Mcp-Session-Id on requests after initialize", async () => {
    const calls: RequestInit[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        calls.push(init ?? {});
        const method = JSON.parse(String(init?.body)).method as string;

        if (method === "initialize") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              result: { protocolVersion: "2024-11-05", capabilities: {} },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "mcp-session-id": "sess-abc",
              },
            },
          );
        }

        if (method === "notifications/initialized") {
          return new Response(null, { status: 202 });
        }

        if (method === "tools/list") {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id: 2,
              result: { tools: [{ name: "get_portfolio", description: "x", inputSchema: { type: "object" } }] },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response("unexpected", { status: 500 });
      }),
    );

    const client = new RobinhoodMcpClient("test-token");
    const tools = await client.listTools();

    expect(tools).toHaveLength(1);
    expect(calls.length).toBeGreaterThanOrEqual(3);

    const initHeaders = calls[0].headers as Record<string, string>;
    expect(initHeaders["Mcp-Session-Id"]).toBeUndefined();

    const notifyHeaders = calls[1].headers as Record<string, string>;
    expect(notifyHeaders["Mcp-Session-Id"]).toBe("sess-abc");

    const listHeaders = calls[2].headers as Record<string, string>;
    expect(listHeaders["Mcp-Session-Id"]).toBe("sess-abc");
  });
});
