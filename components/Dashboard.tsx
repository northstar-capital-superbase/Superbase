"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AgentRoster, type AgentStatus } from "./AgentRoster";
import { MemoryPanel } from "./MemoryPanel";
import { MemoryExplorer } from "./MemoryExplorer";
import { Chat, type ChatTurn } from "./Chat";
import { Integrations } from "./Integrations";
import {
  type AgentProfile,
  type CrewEvent,
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
  const [explorerOpen, setExplorerOpen] = useState(false);

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

  const pushAssistant = useCallback(
    (content: string, run?: CrewRun) =>
      setTurns((t) => [
        ...t,
        { id: crypto.randomUUID(), role: "assistant", content, run },
      ]),
    [],
  );

  // Non-streaming fallback if SSE is unavailable.
  const runFallback = useCallback(
    async (task: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: SESSION_ID, task }),
      });
      const data = (await res.json()) as CrewRun & { error?: string };
      setStatuses(Object.fromEntries(SPECIALIST_FLOW.map((id) => [id, "done"])));
      if (!res.ok || data.error) pushAssistant(`⚠️ ${data.error ?? "Run failed."}`);
      else pushAssistant(data.synthesis.output, data);
    },
    [pushAssistant],
  );

  // Stream a turn through the pipeline, driving real agent statuses from
  // CrewEvents and refreshing the memory tail as each agent writes to it.
  const send = useCallback(
    async (task: string) => {
      setBusy(true);
      setTurns((t) => [
        ...t,
        { id: crypto.randomUUID(), role: "user", content: task },
      ]);
      setStatuses({ orchestrator: "thinking" });

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: SESSION_ID, task }),
        });
        if (!res.ok || !res.body) {
          await runFallback(task);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finished = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const payload = dataLine.slice(5).trim();
            if (!payload) continue;
            const ev = JSON.parse(payload) as CrewEvent;

            switch (ev.type) {
              case "agent_start":
                setStatuses((s) => ({ ...s, [ev.agent]: "thinking" }));
                break;
              case "plan":
                setStatuses((s) => ({ ...s, orchestrator: "done" }));
                break;
              case "agent_result":
                setStatuses((s) => ({ ...s, [ev.result.agent]: "done" }));
                refreshMemory();
                break;
              case "synthesis_start":
                setStatuses((s) => ({ ...s, orchestrator: "thinking" }));
                break;
              case "synthesis":
                setStatuses((s) => ({ ...s, orchestrator: "done" }));
                break;
              case "done":
                finished = true;
                pushAssistant(ev.run.synthesis.output, ev.run);
                break;
              case "error":
                finished = true;
                pushAssistant(`⚠️ ${ev.error}`);
                break;
            }
          }
        }

        if (!finished) await runFallback(task);
      } catch (err) {
        pushAssistant(`⚠️ ${err instanceof Error ? err.message : "Network error"}`);
      } finally {
        setBusy(false);
        await refreshMemory();
        setTimeout(() => setStatuses({}), 1200);
      }
    },
    [pushAssistant, refreshMemory, runFallback],
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

        <Integrations />

        <AgentRoster agents={agents} statuses={statuses} />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <Chat turns={turns} busy={busy} onSend={send} />
          <div className="hidden min-h-0 lg:block">
            <MemoryPanel
              entries={memory}
              onClear={clearMemory}
              onExplore={() => setExplorerOpen(true)}
            />
          </div>
        </div>
      </main>

      <MemoryExplorer
        sessionId={SESSION_ID}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </div>
  );
}
