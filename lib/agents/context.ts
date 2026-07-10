import type { ChatMessage } from "../llm/types";
import type { AgentContext } from "./types";

// Packages recent shared memory + the task into the message list every agent
// sends to the model. Single source of truth (was duplicated across the base
// agent and the trading agent).
export function buildMemoryMessages(ctx: AgentContext): ChatMessage[] {
  const messages: ChatMessage[] = [];

  if (ctx.memory.length) {
    const context = ctx.memory
      .map((m) => `[${m.author}] ${m.content}`)
      .join("\n");
    messages.push({
      role: "user",
      content: `Shared lab memory (oldest first, newest last):\n${context}`,
    });
  }

  messages.push({ role: "user", content: `Task: ${ctx.task}` });
  return messages;
}
