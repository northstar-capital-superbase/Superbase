import { getAgent, SPECIALIST_ORDER, type AgentId } from "../agents";
import type { AgentResult } from "../agents/types";
import { getMemory, memoryBackend } from "../memory";
import type { MemoryEntry } from "../memory/types";

export interface RunOptions {
  sessionId: string;
  task: string;
  // Subset of specialists to consult. Defaults to all, in order.
  specialists?: AgentId[];
}

export interface CrewRun {
  sessionId: string;
  task: string;
  plan: string;
  specialistResults: AgentResult[];
  synthesis: AgentResult;
  backend: "supabase" | "in-memory";
}

// The core multi-agent workflow:
//   1. Orchestrator drafts a plan from the task + recent shared memory.
//   2. Each specialist runs in sequence, each seeing prior specialists' output
//      via shared memory (research -> strategist -> behavioral).
//   3. Orchestrator synthesizes everything into the final answer.
// Every step is written back to shared memory so runs compound over time.
export async function runCrew(opts: RunOptions): Promise<CrewRun> {
  const { sessionId, task } = opts;
  const specialists = opts.specialists ?? SPECIALIST_ORDER;
  const memory = getMemory();

  // Record the user's task.
  await memory.append({
    sessionId,
    kind: "message",
    author: "user",
    content: task,
  });

  const loadContext = async (): Promise<MemoryEntry[]> =>
    memory.recent({ sessionId, limit: 24 });

  // 1. Orchestrator plans.
  const orchestrator = getAgent("orchestrator");
  const planResult = await orchestrator.run({
    sessionId,
    task: `Draft a short delegation plan for this task, naming which specialists matter most: "${task}"`,
    memory: await loadContext(),
  });
  await memory.append({
    sessionId,
    kind: "plan",
    author: "orchestrator",
    content: planResult.output,
  });

  // 2. Specialists run in sequence, each building on prior shared memory.
  const specialistResults: AgentResult[] = [];
  for (const id of specialists) {
    const agent = getAgent(id);
    const result = await agent.run({
      sessionId,
      task,
      memory: await loadContext(),
    });
    specialistResults.push(result);
    await memory.append({
      sessionId,
      kind: "agent_output",
      author: id,
      content: result.output,
      metadata: { ms: result.ms, model: result.model },
    });
  }

  // 3. Orchestrator synthesizes the final answer from all contributions.
  const synthesis = await orchestrator.run({
    sessionId,
    task: `Synthesize the specialists' contributions into one clear answer for: "${task}"`,
    memory: await loadContext(),
  });
  await memory.append({
    sessionId,
    kind: "agent_output",
    author: "orchestrator",
    content: synthesis.output,
    metadata: { ms: synthesis.ms, model: synthesis.model, final: true },
  });

  return {
    sessionId,
    task,
    plan: planResult.output,
    specialistResults,
    synthesis,
    backend: memoryBackend(),
  };
}
