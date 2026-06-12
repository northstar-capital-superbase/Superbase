"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import { Chat, type ChatTurn } from "@/components/chat/Chat";
import { MemoryExplorer } from "@/components/memory/MemoryExplorer";
import { useSessions } from "@/components/session/useSessions";
import {
  type AgentProfile,
  type CrewEvent,
  type CrewRun,
  type MemoryEntry,
  pipelineAgentIds,
  type TradingInfo,
} from "@/components/shared";
import { AgentOpsRail } from "./AgentOpsRail";
import { ExecutionTimeline } from "./ExecutionTimeline";
import { IntelligenceStack } from "./IntelligenceStack";
import { LabsNav } from "./LabsNav";
import { OperationalHeader } from "./OperationalHeader";
import {
  buildAgentActivity,
  buildExecutionTimeline,
  buildInsights,
  countDirectives,
  formatTime,
} from "./labsIntel";
import "@/components/showcase/showcase.css";
import "./labs.css";

function reconstructTurns(entries: MemoryEntry[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const e of entries) {
    if (e.author === "user" && e.kind === "message") {
      turns.push({ id: e.id, role: "user", content: e.content });
    } else if (e.author === "orchestrator" && e.kind === "agent_output") {
      turns.push({ id: e.id, role: "assistant", content: e.content });
    }
  }
  return turns;
}

export function LabsOperatingCore() {
  const { sessions, activeId, create, remove, setActive } = useSessions();
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [trading, setTrading] = useState<TradingInfo | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [busy, setBusy] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);

  const refreshMemory = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${activeId}`);
    if (res.ok) setMemory((await res.json()).entries ?? []);
  }, [activeId]);

  const pipelineFlow = useMemo(
    () => pipelineAgentIds(trading?.traderInCrew ?? false),
    [trading?.traderInCrew],
  );

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setTrading(d.trading ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setStatuses({});
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/memory?sessionId=${activeId}&limit=300`);
      const entries: MemoryEntry[] = res.ok
        ? ((await res.json()).entries ?? [])
        : [];
      if (cancelled) return;
      setMemory(entries.slice(-80));
      setTurns(reconstructTurns(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const pushAssistant = useCallback(
    (content: string, run?: CrewRun) =>
      setTurns((t) => [
        ...t,
        { id: crypto.randomUUID(), role: "assistant", content, run },
      ]),
    [],
  );

  const runFallback = useCallback(
    async (task: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId, task }),
      });
      const data = (await res.json()) as CrewRun & { error?: string };
      setStatuses(Object.fromEntries(pipelineFlow.map((id) => [id, "done"])));
      if (!res.ok || data.error) pushAssistant(`⚠️ ${data.error ?? "Run failed."}`);
      else pushAssistant(data.synthesis.output, data);
    },
    [pushAssistant, activeId, pipelineFlow],
  );

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
          body: JSON.stringify({ sessionId: activeId, task }),
        });
        if (res.status === 429 || res.status === 400) {
          const d = await res.json().catch(() => ({}));
          pushAssistant(`⚠️ ${d.error ?? "Request rejected."}`);
          return;
        }
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
    [pushAssistant, refreshMemory, runFallback, activeId],
  );

  const removeSession = useCallback(
    (id: string) => {
      fetch(`/api/memory?sessionId=${id}`, { method: "DELETE" }).catch(() => {});
      remove(id);
    },
    [remove],
  );

  const activeCount = Object.values(statuses).filter((s) => s === "thinking").length;
  const timeline = useMemo(
    () => buildExecutionTimeline(memory, turns, busy),
    [memory, turns, busy],
  );
  const insights = useMemo(() => buildInsights(memory), [memory]);
  const agentActivity = useMemo(
    () => buildAgentActivity(memory, agents),
    [memory, agents],
  );
  const directiveCount = useMemo(() => countDirectives(memory), [memory]);

  const recentActions = useMemo(() => {
    return [...memory]
      .filter((e) => e.kind === "agent_output" || e.kind === "plan")
      .reverse()
      .slice(0, 4)
      .map((e) => ({
        id: e.id,
        label:
          e.kind === "plan"
            ? "Plan published"
            : `${e.author} synthesis`,
        time: formatTime(e.createdAt),
      }));
  }, [memory]);

  return (
    <div className="labs-root ns-root">
      <LabsNav />

      <div className="ops-body">
        <OperationalHeader
          sessions={sessions}
          activeId={activeId}
          onSwitch={setActive}
          onCreate={create}
          onRemove={removeSession}
          busy={busy}
          activeAgents={activeCount}
          insightCount={insights.length}
          directiveCount={directiveCount}
          trading={trading}
        />

        <div className="ops-grid">
          <AgentOpsRail
            agents={agents}
            statuses={statuses}
            activity={agentActivity}
            busy={busy}
          />

          <div className="ops-center">
            <ExecutionTimeline events={timeline} />
            <div className="ops-command">
              <Chat
                turns={turns}
                busy={busy}
                onSend={send}
                tradingEnabled={trading?.traderInCrew ?? false}
                title="Active work"
                subtitle={busy ? "Executing" : "Ready"}
                variant="operational"
              />
            </div>
          </div>

          <IntelligenceStack
            insights={insights}
            trading={trading}
            onExplore={() => setExplorerOpen(true)}
            recentActions={recentActions}
          />
        </div>
      </div>

      <MemoryExplorer
        sessionId={activeId}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </div>
  );
}
