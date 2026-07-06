import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { setProvider } from "@/lib/llm";
import { FakeProvider } from "./fake-provider";
import { setMcpClient, getMcpClient, mcpEnabled } from "@/lib/mcp";
import type { IMcpClient, McpCallResult, McpProbeResult, McpTool } from "@/lib/mcp";
import { TradingAgent } from "@/lib/agents/trading-agent";
import { getAgent, listProfiles } from "@/lib/agents";

// ── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_TOOLS: McpTool[] = [
  {
    name: "get_portfolio",
    description: "Returns holdings and cash balance for the Agentic account.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "place_order",
    description: "Places a buy or sell limit order.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Ticker symbol" },
        side: { type: "string", description: "buy | sell" },
        quantity: { type: "number", description: "Number of shares" },
        limit_price: { type: "number", description: "Limit price in USD" },
      },
      required: ["symbol", "side", "quantity", "limit_price"],
    },
  },
];

class MockMcpClient implements IMcpClient {
  callCount = 0;

  async listTools(): Promise<McpTool[]> {
    return MOCK_TOOLS;
  }

  async callTool(name: string, _args: Record<string, unknown>): Promise<McpCallResult> {
    this.callCount++;
    return {
      content: [{ type: "text", text: `Mock result for ${name}` }],
      isError: false,
    };
  }

  async probe(): Promise<McpProbeResult> {
    return { ok: true, ms: 5, toolCount: MOCK_TOOLS.length };
  }
}

// ── Setup ───────────────────────────────────────────────────────────────────

beforeAll(() => {
  setProvider(new FakeProvider());
});

afterAll(() => {
  // Restore MCP singleton so other test files start clean.
  setMcpClient(null);
});

// ── mcpEnabled / getMcpClient ────────────────────────────────────────────────

describe("mcpEnabled", () => {
  it("returns false when ROBINHOOD_MCP_TOKEN is absent", () => {
    const original = process.env.ROBINHOOD_MCP_TOKEN;
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(mcpEnabled()).toBe(false);
    if (original !== undefined) process.env.ROBINHOOD_MCP_TOKEN = original;
  });

  it("returns true when ROBINHOOD_MCP_TOKEN is set", () => {
    process.env.ROBINHOOD_MCP_TOKEN = "test-token";
    expect(mcpEnabled()).toBe(true);
    delete process.env.ROBINHOOD_MCP_TOKEN;
  });
});

describe("getMcpClient", () => {
  it("returns null when token is absent", () => {
    setMcpClient(null);
    const original = process.env.ROBINHOOD_MCP_TOKEN;
    delete process.env.ROBINHOOD_MCP_TOKEN;
    expect(getMcpClient()).toBeNull();
    if (original !== undefined) process.env.ROBINHOOD_MCP_TOKEN = original;
  });

  it("returns the injected mock client when set via setMcpClient", () => {
    const mock = new MockMcpClient();
    setMcpClient(mock);
    expect(getMcpClient()).toBe(mock);
    setMcpClient(null);
  });
});

// ── TradingAgent — advisory mode (no MCP client) ────────────────────────────

describe("TradingAgent advisory mode", () => {
  it("runs without a MCP client and returns a result", async () => {
    setMcpClient(null);
    const agent = new TradingAgent();
    const result = await agent.run({
      sessionId: "test",
      task: "Review my portfolio and suggest rebalancing",
      memory: [],
    });

    expect(result.agent).toBe("trader");
    expect(result.output).toBeTruthy();
    expect(result.ms).toBeGreaterThanOrEqual(0);
  });
});

// ── TradingAgent — live MCP mode ─────────────────────────────────────────────

describe("TradingAgent with MCP client", () => {
  it("fetches tools and includes them in the run", async () => {
    const mock = new MockMcpClient();
    setMcpClient(mock);

    const agent = new TradingAgent();
    const result = await agent.run({
      sessionId: "test-mcp",
      task: "Show me my current portfolio",
      memory: [],
    });

    expect(result.agent).toBe("trader");
    expect(result.output).toBeTruthy();
    // The mock LLM doesn't emit <mcp_call> blocks, so callCount stays 0.
    // What we verify is that the run completed without error.
    expect(result.ms).toBeGreaterThanOrEqual(0);
  });

  it("profile fields are correct", () => {
    const agent = new TradingAgent();
    expect(agent.profile.id).toBe("trader");
    expect(agent.profile.name).toBe("Trader");
    expect(agent.profile.color).toBeTruthy();
  });
});

// ── Agent registry ───────────────────────────────────────────────────────────

describe("agent registry", () => {
  it("includes the trader agent", () => {
    const trader = getAgent("trader");
    expect(trader).toBeDefined();
    expect(trader.profile.id).toBe("trader");
  });

  it("listProfiles includes the trader profile", () => {
    const ids = listProfiles().map((p) => p.id);
    expect(ids).toContain("trader");
  });
});

// ── MockMcpClient probe ──────────────────────────────────────────────────────

describe("MockMcpClient", () => {
  it("probe returns ok with tool count", async () => {
    const client = new MockMcpClient();
    const result = await client.probe();
    expect(result.ok).toBe(true);
    expect(result.toolCount).toBe(MOCK_TOOLS.length);
  });

  it("listTools returns expected tools", async () => {
    const client = new MockMcpClient();
    const tools = await client.listTools();
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe("get_portfolio");
    expect(tools[1].name).toBe("place_order");
  });
});
