"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AgentRoster, type AgentStatus } from "./AgentRoster";
import { MemoryPanel } from "./MemoryPanel";
import { Chat, type ChatTurn } from "./Chat";
import {
  type AgentProfile,
  type CrewRun,
  type MemoryEntry,
  type RuntimeInfo,
} from "./shared";

const SESSION_ID = "default";
const SPECIALIST_FLOW: AgentProfile["id"][] = [
  "orchestrator",
  "research",
  "strategist",
  "behavioral",
];

// Top-level client orchestration: loads the roster, drives a chat turn through
// /api/chat, animates agent statuses, and tails shared memory.
export function Dashboard() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [busy, setBusy] = useState(false);

  const refreshMemory = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${SESSION_ID}`);
    if (res.ok) setMemory((await res.json()).entries ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setRuntime(d.runtime ?? null);
      })
      .catch(() => {});
    refreshMemory();
  }, [refreshMemory]);

  // Visually walk the agents through the pipeline while the request runs.
  const animateFlow = useCallback(() => {
    let i = 0;
    setStatuses({ orchestrator: "thinking" });
    const timer = setInterval(() => {
      i += 1;
      if (i >= SPECIALIST_FLOW.length) return;
      setStatuses((prev) => {
        const next = { ...prev };
        next[SPECIALIST_FLOW[i - 1]] = "done";
        next[SPECIALIST_FLOW[i]] = "thinking";
        return next;
      });
    }, 700);
    return timer;
  }, []);

  const send = useCallback(
    async (task: string) => {
      setBusy(true);
      const userTurn: ChatTurn = {
        id: crypto.randomUUID(),
        role: "user",
        content: task,
      };
      setTurns((t) => [...t, userTurn]);
      const timer = animateFlow();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: SESSION_ID, task }),
        });
        const data = (await res.json()) as CrewRun & { error?: string };
        clearInterval(timer);
        setStatuses(
          Object.fromEntries(SPECIALIST_FLOW.map((id) => [id, "done"])),
        );

        if (!res.ok || data.error) {
          setTurns((t) => [
            ...t,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `⚠️ ${data.error ?? "Run failed."}`,
            },
          ]);
        } else {
          setTurns((t) => [
            ...t,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.synthesis.output,
              run: data,
            },
          ]);
        }
      } catch (err) {
        clearInterval(timer);
        setTurns((t) => [
          ...t,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ ${err instanceof Error ? err.message : "Network error"}`,
          },
        ]);
      } finally {
        setBusy(false);
        await refreshMemory();
        setTimeout(() => setStatuses({}), 1200);
      }
    },
    [animateFlow, refreshMemory],
  );

  const clearMemory = useCallback(async () => {
    await fetch(`/api/memory?sessionId=${SESSION_ID}`, { method: "DELETE" });
    setMemory([]);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar runtime={runtime} />

      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Agent Operating System
            </h1>
            <p className="text-[12px] text-slate-500">
              Local-first multi-agent lab · session{" "}
              <span className="font-mono text-slate-400">{SESSION_ID}</span>
            </p>
          </div>
        </header>

        <AgentRoster agents={agents} statuses={statuses} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <Chat turns={turns} busy={busy} onSend={send} />
          <div className="hidden min-h-0 lg:block">
            <MemoryPanel entries={memory} onClear={clearMemory} />
          </div>
        </div>
      </main>
    </div>
  );
}
