import { getAgent, type AgentId } from "../agents";
import { resolveSpecialists } from "../agents/specialists";
import type { AgentResult } from "../agents/types";
import { getMemory, memoryBackend } from "../memory";
import type { MemoryEntry } from "../memory/types";

export interface RunOptions {
  sessionId: string;
  task: string;
  // Subset of specialists to consult. Defaults to all, in order.
  specialists?: AgentId[];
  // Authenticated owner of this run, resolved server-side. When set, every
  // memory read/write for this run is scoped to (and authenticated as) this
  // user — never trusted from client input.
  userId?: string;
  accessToken?: string;
  // The global Robinhood credential is owner-only until per-user token
  // storage lands. API routes compute this from the authenticated email.
  tradingAllowed?: boolean;
}

export interface CrewRun {
  sessionId: string;
  task: string;
  plan: string;
  // Orchestrator plan-phase cost, so the UI trace can account for every call.
  planMs?: number;
  planTokens?: { input: number; output: number };
  specialistResults: AgentResult[];
  synthesis: AgentResult;
  backend: "supabase" | "in-memory";
}

// Events emitted as the workflow progresses, so the UI can show each agent's
// status and output the moment it happens (rather than after the whole run).
export type CrewEvent =
  | { type: "plan"; content: string }
  | { type: "agent_start"; agent: AgentId }
  | { type: "agent_result"; result: AgentResult }
  | { type: "synthesis_start" }
  | { type: "synthesis"; result: AgentResult }
  | { type: "done"; run: CrewRun }
  | { type: "error"; error: string };

// The core multi-agent workflow, as a stream:
//   1. Orchestrator drafts a plan from the task + recent shared memory.
//   2. Each specialist runs in sequence, each seeing prior specialists' output
//      via shared memory (research -> strategist -> behavioral).
//   3. Orchestrator synthesizes everything into the final answer.
// Every step is written back to shared memory so runs compound over time, and
// emitted as a CrewEvent so the dashboard reflects real progress.
export async function* streamCrew(opts: RunOptions): AsyncGenerator<CrewEvent> {
  const { sessionId, task, userId, accessToken } = opts;
  const specialists = resolveSpecialists(opts.specialists, opts.tradingAllowed ?? false);
  const memory = getMemory({ accessToken });
  const loadContext = (): Promise<MemoryEntry[]> =>
    memory.recent({ sessionId, userId, limit: 24 });

  try {
    // Record the user's task.
    await memory.append({ sessionId, userId, kind: "message", author: "user", content: task });

    // 1. Orchestrator plans.
    yield { type: "agent_start", agent: "orchestrator" };
    const orchestrator = getAgent("orchestrator");
    const planResult = await orchestrator.run({
      sessionId,
      task: `Draft a short delegation plan for this task, naming which specialists matter most: "${task}"`,
      memory: await loadContext(),
      userId,
      accessToken,
    });
    await memory.append({
      sessionId,
      userId,
      kind: "plan",
      author: "orchestrator",
      content: planResult.output,
    });
    yield { type: "plan", content: planResult.output };

    // 2. Specialists run in sequence, each building on prior shared memory.
    const specialistResults: AgentResult[] = [];
    for (const id of specialists) {
      yield { type: "agent_start", agent: id };
      const result = await getAgent(id).run({
        sessionId,
        task,
        memory: await loadContext(),
        userId,
        accessToken,
      });
      specialistResults.push(result);
      await memory.append({
        sessionId,
        userId,
        kind: "agent_output",
        author: id,
        content: result.output,
        metadata: { ms: result.ms, model: result.model },
      });
      yield { type: "agent_result", result };
    }

    // 3. Orchestrator synthesizes the final answer from all contributions.
    yield { type: "synthesis_start" };
    const synthesis = await orchestrator.run({
      sessionId,
      task: `Synthesize the specialists' contributions into one clear answer for: "${task}"`,
      memory: await loadContext(),
      userId,
      accessToken,
    });
    await memory.append({
      sessionId,
      userId,
      kind: "agent_output",
      author: "orchestrator",
      content: synthesis.output,
      metadata: { ms: synthesis.ms, model: synthesis.model, final: true },
    });
    yield { type: "synthesis", result: synthesis };

    yield {
      type: "done",
      run: {
        sessionId,
        task,
        plan: planResult.output,
        planMs: planResult.ms,
        planTokens: planResult.tokens,
        specialistResults,
        synthesis,
        backend: memoryBackend(),
      },
    };
  } catch (err) {
    yield { type: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

// Non-streaming convenience wrapper — drains the stream to the final result.
export async function runCrew(opts: RunOptions): Promise<CrewRun> {
  let run: CrewRun | undefined;
  for await (const ev of streamCrew(opts)) {
    if (ev.type === "done") run = ev.run;
    else if (ev.type === "error") throw new Error(ev.error);
  }
  if (!run) throw new Error("crew produced no result");
  return run;
}
