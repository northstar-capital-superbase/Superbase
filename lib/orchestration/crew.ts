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
}

export interface CrewRun {
  sessionId: string;
  task: string;
  plan: string;
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
  const { sessionId, task } = opts;
  const specialists = resolveSpecialists(opts.specialists);
  const memory = getMemory();
  const loadContext = (): Promise<MemoryEntry[]> =>
    memory.recent({ sessionId, limit: 24 });

  try {
    // Record the user's task.
    await memory.append({ sessionId, kind: "message", author: "user", content: task });

    // 1. Orchestrator plans.
    yield { type: "agent_start", agent: "orchestrator" };
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
    yield { type: "plan", content: planResult.output };

    // 2. Specialists run in sequence, each building on prior shared memory.
    const specialistResults: AgentResult[] = [];
    for (const id of specialists) {
      yield { type: "agent_start", agent: id };
      const result = await getAgent(id).run({
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
      yield { type: "agent_result", result };
    }

    // 3. Orchestrator synthesizes the final answer from all contributions.
    yield { type: "synthesis_start" };
    const raw = await orchestrator.run({
      sessionId,
      task: `Synthesize the specialists' contributions into one clear answer for: "${task}"`,
      memory: await loadContext(),
    });
    // Extract the trust block (confidence + consequence-of-inaction) and strip
    // it from the prose the user reads. Every recommendation must carry both.
    const { text, confidence, consequenceOfInaction } = parseSynthesisMeta(raw.output);
    const synthesis: AgentResult = {
      ...raw,
      output: text,
      confidence,
      consequenceOfInaction,
    };
    await memory.append({
      sessionId,
      kind: "agent_output",
      author: "orchestrator",
      content: synthesis.output,
      metadata: {
        ms: synthesis.ms,
        model: synthesis.model,
        final: true,
        confidence,
        consequenceOfInaction,
      },
    });
    yield { type: "synthesis", result: synthesis };

    yield {
      type: "done",
      run: {
        sessionId,
        task,
        plan: planResult.output,
        specialistResults,
        synthesis,
        backend: memoryBackend(),
      },
    };
  } catch (err) {
    yield { type: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

// Parse the orchestrator's trailing trust block:
//   CONFIDENCE: <0-100>
//   IF_YOU_DO_NOTHING: <sentence>
// Returns the prose with the block removed, plus the parsed fields. Tolerant of
// models that omit or reformat it (fields come back undefined), so the run
// never fails on a malformed block.
export function parseSynthesisMeta(output: string): {
  text: string;
  confidence?: number;
  consequenceOfInaction?: string;
} {
  let confidence: number | undefined;
  let consequenceOfInaction: string | undefined;

  const confMatch = output.match(/CONFIDENCE:\s*(\d{1,3})/i);
  if (confMatch) {
    const n = Number(confMatch[1]);
    if (Number.isFinite(n)) confidence = Math.max(0, Math.min(100, n));
  }
  const consMatch = output.match(/IF_YOU_DO_NOTHING:\s*(.+?)\s*$/is);
  if (consMatch) {
    consequenceOfInaction = consMatch[1].trim().split(/\n/)[0].trim() || undefined;
  }

  // Strip the trust block (and any leading "---" separator) from the prose.
  const text = output
    .replace(/\n?-{3,}\s*(?=[\s\S]*CONFIDENCE:)/i, "\n")
    .replace(/CONFIDENCE:\s*\d{1,3}.*$/is, "")
    .replace(/IF_YOU_DO_NOTHING:.*$/is, "")
    .trimEnd();

  return { text: text || output.trim(), confidence, consequenceOfInaction };
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
