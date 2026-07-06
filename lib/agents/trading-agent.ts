import { getMcpClient } from "../mcp";
import type { McpTool } from "../mcp";
import { evaluateToolCall, tradingMode } from "../mcp/trading-policy";
import { getMemory } from "../memory";
import { getProvider } from "../llm";
import type { ChatMessage } from "../llm/types";
import type { AgentContext, AgentResult } from "./types";
import { TRADING } from "./profiles";

// Maximum agentic iterations before forcing a final answer (cost guardrail).
const MAX_TOOL_ITERATIONS = 4;

// Sentinel used inside the agent's output to request a tool call.
// Format: <mcp_call tool="tool_name">{"arg": "value"}</mcp_call>
const TOOL_CALL_RE =
  /<mcp_call\s+tool="([^"]+)">([\s\S]*?)<\/mcp_call>/gi;

// Specialist agent that extends the base completion loop with a live MCP tool
// loop. When ROBINHOOD_MCP_TOKEN is set, it fetches the Robinhood tool list,
// injects tool descriptions into the system prompt, and iterates until the LLM
// produces a response with no pending tool calls (or MAX_TOOL_ITERATIONS).
//
// When the token is absent the agent degrades gracefully to a plain completion
// that describes what it would do (advisory mode).
export class TradingAgent {
  readonly profile = TRADING;

  async run(ctx: AgentContext): Promise<AgentResult> {
    const provider = getProvider();
    const mcp = getMcpClient();
    const started = Date.now();

    // No token configured — run in advisory mode.
    if (!mcp) {
      const res = await provider.complete({
        system: advisorySystemPrompt(),
        messages: buildMessages(ctx, []),
        temperature: 0.5,
        maxTokens: 900,
      });
      return {
        agent: "trader",
        output: res.text,
        provider: res.provider,
        model: res.model,
        ms: Date.now() - started,
        tokens: res.usage
          ? { input: res.usage.inputTokens, output: res.usage.outputTokens }
          : undefined,
      };
    }

    // Fetch the available Robinhood tools (cached within this request).
    let tools: McpTool[] = [];
    try {
      tools = await mcp.listTools();
    } catch {
      // Degraded: proceed without tools so the run doesn't hard-fail.
    }

    const systemPrompt = buildSystemPrompt(tools);
    const messages: ChatMessage[] = buildMessages(ctx, tools);

    let totalInput = 0;
    let totalOutput = 0;
    let lastText = "";
    let ordersExecuted = 0; // mutating calls run this turn (per-run cap)

    // Agentic tool-call loop: iterate until no pending calls or limit reached.
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      const res = await provider.complete({
        system: systemPrompt,
        messages,
        temperature: 0.3,
        maxTokens: 1200,
      });

      totalInput += res.usage?.inputTokens ?? 0;
      totalOutput += res.usage?.outputTokens ?? 0;
      lastText = res.text;

      // Push the assistant turn so next iteration has full context.
      messages.push({ role: "assistant", content: res.text });

      const calls = extractToolCalls(res.text);
      if (calls.length === 0) break;

      // Execute tool calls, enforcing the trading policy in code. Mutating
      // calls (orders) are gated by mode + hard caps and audited to memory.
      const results: string[] = [];
      for (const { tool, args } of calls) {
        const decision = evaluateToolCall(tool, args, ordersExecuted);

        if (!decision.allow) {
          if (decision.mutating) {
            await audit(ctx.sessionId, `BLOCKED ${tool} ${compact(args)} — ${decision.reason}`);
          }
          results.push(
            `<tool_result tool="${tool}" error="true">BLOCKED by trading policy: ${decision.reason}</tool_result>`,
          );
          continue;
        }

        if (decision.mutating) {
          ordersExecuted += 1;
          await audit(ctx.sessionId, `ORDER ${tool} ${compact(args)} (mode=${tradingMode()})`);
        }

        try {
          const result = await mcp.callTool(tool, args);
          const text = result.content
            .map((b) => (b.type === "text" ? b.text : `[${b.type}]`))
            .join("\n");
          results.push(
            result.isError
              ? `<tool_result tool="${tool}" error="true">${text}</tool_result>`
              : `<tool_result tool="${tool}">${text}</tool_result>`,
          );
        } catch (err) {
          results.push(
            `<tool_result tool="${tool}" error="true">${err instanceof Error ? err.message : String(err)}</tool_result>`,
          );
        }
      }

      messages.push({ role: "user", content: results.join("\n\n") });
    }

    return {
      agent: "trader",
      output: lastText,
      provider: provider.name,
      model: provider.model,
      ms: Date.now() - started,
      tokens:
        totalInput > 0
          ? { input: totalInput, output: totalOutput }
          : undefined,
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

// Append an audit line for every order decision to shared memory (so it shows
// in the run trace / Memory Explorer) and to the server log.
async function audit(sessionId: string, line: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.warn(`[trading-audit] ${sessionId} :: ${line}`);
  try {
    await getMemory().append({
      sessionId,
      kind: "fact",
      author: "trader",
      content: `[audit] ${line}`,
      metadata: { audit: true },
    });
  } catch {
    /* never let audit logging break a run */
  }
}

function compact(args: Record<string, unknown>): string {
  const s = JSON.stringify(args);
  return s.length > 200 ? s.slice(0, 200) + "…" : s;
}

function advisorySystemPrompt(): string {
  return `${TRADING.systemPrompt}

NOTE: No Robinhood MCP token is configured (ROBINHOOD_MCP_TOKEN is unset).
You are running in advisory mode — describe what you would do and why, as if
you had live account access, but do not claim to execute real trades.`;
}

function buildSystemPrompt(tools: McpTool[]): string {
  const toolDocs =
    tools.length === 0
      ? "(No tools available — Robinhood MCP connection may be degraded.)"
      : tools
          .map((t) => {
            const props = t.inputSchema?.properties ?? {};
            const params = Object.entries(props)
              .map(([k, v]) => `  - ${k}: ${v.description ?? v.type}`)
              .join("\n");
            return `### ${t.name}\n${t.description}${params ? `\nParameters:\n${params}` : ""}`;
          })
          .join("\n\n");

  return `${TRADING.systemPrompt}

## Available Robinhood Trading Tools

${toolDocs}

## How to call a tool

Include a call block anywhere in your response:

<mcp_call tool="tool_name">{"arg1": "value1", "arg2": "value2"}</mcp_call>

The tool result will be returned as a <tool_result> block, then you continue.
You may call multiple tools per turn. When you have all the information you need,
provide your final answer without any <mcp_call> blocks.`;
}

function buildMessages(ctx: AgentContext, _tools: McpTool[]): ChatMessage[] {
  const messages: ChatMessage[] = [];

  if (ctx.memory.length) {
    const context = ctx.memory
      .map((m) => `[${m.author}] ${m.content}`)
      .join("\n");
    messages.push({
      role: "user",
      content: `Shared lab memory (most recent last):\n${context}`,
    });
  }

  messages.push({ role: "user", content: `Task: ${ctx.task}` });
  return messages;
}

interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
}

function extractToolCalls(text: string): ToolCall[] {
  const calls: ToolCall[] = [];
  const re = new RegExp(TOOL_CALL_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const tool = m[1];
    let args: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(m[2].trim());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      // Malformed JSON — call the tool with no args.
    }
    calls.push({ tool, args });
  }
  return calls;
}
