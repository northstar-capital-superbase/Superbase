import type { ChatTurn } from "@/components/chat/Chat";
import { AGENT_META, type AgentProfile, type MemoryEntry } from "@/components/shared";

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  detail: string;
  tone: "user" | "agent" | "system" | "insight";
  color?: string;
}

export interface InsightItem {
  id: string;
  source: string;
  kind: string;
  headline: string;
  body: string;
  time: string;
  color: string;
}

export interface AgentActivity {
  lastAction: string;
  lastAt: string | null;
}

const INSIGHT_KINDS = new Set(["agent_output", "fact", "plan"]);

export function buildExecutionTimeline(
  memory: MemoryEntry[],
  turns: ChatTurn[],
  busy: boolean,
): TimelineEvent[] {
  const fromMemory: TimelineEvent[] = [...memory]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-14)
    .map((e) => {
      const meta = AGENT_META[e.author as keyof typeof AGENT_META];
      const isUser = e.author === "user";
      return {
        id: e.id,
        time: formatTime(e.createdAt),
        label: isUser
          ? "Directive issued"
          : `${meta?.label ?? e.author} · ${e.kind}`,
        detail: e.content.slice(0, 160),
        tone: isUser ? "user" : e.kind === "plan" ? "system" : "agent",
        color: meta?.color,
      } as TimelineEvent;
    });

  if (busy) {
    fromMemory.push({
      id: "live-run",
      time: "now",
      label: "Workflow executing",
      detail: "Crew is processing the current directive.",
      tone: "system",
      color: "#6E8BFF",
    });
  }

  if (fromMemory.length === 0 && turns.length > 0) {
    return turns.slice(-6).map((t) => ({
      id: t.id,
      time: "—",
      label: t.role === "user" ? "Directive" : "Synthesis",
      detail: t.content.slice(0, 160),
      tone: t.role === "user" ? "user" : "agent",
      color: "#6E8BFF",
    }));
  }

  return fromMemory;
}

export function buildInsights(memory: MemoryEntry[]): InsightItem[] {
  return [...memory]
    .filter((e) => INSIGHT_KINDS.has(e.kind))
    .reverse()
    .slice(0, 8)
    .map((e) => {
      const meta = AGENT_META[e.author as keyof typeof AGENT_META];
      const color = meta?.color ?? "#6E8BFF";
      const headline = e.content.split("\n")[0].slice(0, 88);
      return {
        id: e.id,
        source: meta?.label ?? e.author,
        kind: e.kind,
        headline: headline + (e.content.length > 88 ? "…" : ""),
        body: e.content,
        time: formatTime(e.createdAt),
        color,
      };
    });
}

export function buildAgentActivity(
  memory: MemoryEntry[],
  agents: AgentProfile[],
): Record<string, AgentActivity> {
  const map: Record<string, AgentActivity> = {};
  for (const a of agents) {
    map[a.id] = { lastAction: a.role, lastAt: null };
  }
  for (const e of [...memory].reverse()) {
    const id = e.author as AgentProfile["id"];
    if (!map[id] || map[id].lastAt) continue;
    map[id] = {
      lastAction:
        e.kind === "plan"
          ? "Published execution plan"
          : e.content.slice(0, 72) + (e.content.length > 72 ? "…" : ""),
      lastAt: formatTime(e.createdAt),
    };
  }
  return map;
}

export function countDirectives(memory: MemoryEntry[]): number {
  return memory.filter((e) => e.author === "user" && e.kind === "message").length;
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
