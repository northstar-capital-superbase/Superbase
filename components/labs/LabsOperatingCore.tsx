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
import { AliveAgentGrid } from "./AliveAgentGrid";
import { AutonomousActivity } from "./AutonomousActivity";
import { InsightsPanel } from "./InsightsPanel";
import { LabsNav } from "./LabsNav";
import { LabsSessionSwitcher } from "./LabsSessionSwitcher";
import { WorkflowStrip } from "./WorkflowStrip";
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
      setMemory(entries.slice(-50));
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

  const clearMemory = useCallback(async () => {
    await fetch(`/api/memory?sessionId=${activeId}`, { method: "DELETE" });
    setMemory([]);
  }, [activeId]);

  const removeSession = useCallback(
    (id: string) => {
      fetch(`/api/memory?sessionId=${id}`, { method: "DELETE" }).catch(() => {});
      remove(id);
    },
    [remove],
  );

  const exportLab = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${activeId}&limit=500`);
    if (!res.ok) return;
    const entries: MemoryEntry[] = (await res.json()).entries ?? [];
    const name = sessions.find((s) => s.id === activeId)?.name ?? activeId;
    const header = `# Northstar Labs — ${name}\n\n_Workspace \`${activeId}\` · exported ${new Date().toLocaleString()}_\n`;
    const body = entries
      .map(
        (e) =>
          `\n## ${e.author} · ${e.kind} · ${new Date(e.createdAt).toLocaleString()}\n\n${e.content}`,
      )
      .join("\n");
    const blob = new Blob([header + body + "\n"], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-${name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeId, sessions]);

  const activeCount = Object.values(statuses).filter((s) => s === "thinking").length;

  return (
    <div className="labs-root ns-root labs-scroll">
      <LabsNav />

      <section className="labs-hero">
        <div className="labs-hero-inner ns-view">
          <span className="ns-eyebrow">Northstar Labs</span>
          <h1 className="labs-hero-title">Operational core</h1>
          <p className="labs-hero-sub">
            Where autonomous agents research, reason, and execute — the living
            center of Northstar OS. Give intent; the crew handles the rest.
          </p>
          <div className="labs-hero-bar">
            <span
              className={`labs-hero-status ${busy ? "is-running" : ""}`}
            >
              <span className="ns-live" />
              {busy
                ? `Crew running · ${activeCount} agent${activeCount !== 1 ? "s" : ""} active`
                : "Systems ready · crew on standby"}
            </span>
            <LabsSessionSwitcher
              sessions={sessions}
              activeId={activeId}
              onSwitch={setActive}
              onCreate={create}
              onRemove={removeSession}
            />
          </div>
        </div>
      </section>

      <section className="labs-section">
        <div className="labs-section-head">
          <div>
            <span className="ns-eyebrow">Active agents</span>
            <h2 className="labs-section-title">Your autonomous crew</h2>
            <p className="labs-section-lede">
              Specialists light up in real time as they research, strategize, and
              act on your behalf.
            </p>
          </div>
        </div>
        <AliveAgentGrid agents={agents} statuses={statuses} />
      </section>

      <section className="labs-section labs-split">
        <WorkflowStrip
          pipeline={pipelineFlow}
          statuses={statuses}
          busy={busy}
        />
        <AutonomousActivity entries={memory} busy={busy} />
      </section>

      <section className="labs-section labs-main-grid">
        <div className="labs-console-wrap">
          <div className="labs-section-head" style={{ marginBottom: 14 }}>
            <div>
              <span className="ns-eyebrow">Task execution</span>
              <h2 className="labs-section-title">Command the crew</h2>
            </div>
          </div>
          <Chat
            turns={turns}
            busy={busy}
            onSend={send}
            tradingEnabled={trading?.traderInCrew ?? false}
            title="Task console"
            subtitle="Intent in · synthesis out"
          />
        </div>
        <InsightsPanel
          entries={memory}
          onExplore={() => setExplorerOpen(true)}
          onExport={exportLab}
          onClear={clearMemory}
        />
      </section>

      <MemoryExplorer
        sessionId={activeId}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </div>
  );
}
