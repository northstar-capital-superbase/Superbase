"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AgentRoster, type AgentStatus } from "./AgentRoster";
import { Connections } from "./Connections";
import { MemoryPanel } from "@/components/memory/MemoryPanel";
import { MemoryExplorer } from "@/components/memory/MemoryExplorer";
import { Chat, type ChatTurn } from "@/components/chat/Chat";
import { MobileLabConsole } from "@/components/mobile/MobileLabConsole";
import { SessionSwitcher } from "@/components/session/SessionSwitcher";
import { useSessions } from "@/components/session/useSessions";
import { Skeleton } from "@/components/ui";
import "./labs.css";
import {
  type AgentProfile,
  type CrewEvent,
  type CrewRun,
  type MemoryEntry,
  pipelineAgentIds,
  type RuntimeInfo,
  type TradingInfo,
} from "@/components/shared";

// Rebuild a chat transcript from persisted memory: user messages become user
// turns, the orchestrator's synthesis (its agent_output) becomes the assistant
// turn. The structured run/trace isn't persisted, so reconstructed assistant
// turns show text only.
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

// Top-level client orchestration: loads the roster, drives a chat turn through
// /api/chat, animates agent statuses, and tails shared memory.
export function Dashboard() {
  const { sessions, activeId, create, remove, setActive } = useSessions();
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
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

  // Agent roster + runtime: load once.
  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setRuntime(d.runtime ?? null);
        setTrading(d.trading ?? null);
      })
      .catch(() => {});
  }, []);

  // On lab switch (and first load), reload that lab's shared memory and rebuild
  // its transcript so switching back to a lab re-shows its conversation.
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

  // Non-streaming fallback if SSE is unavailable.
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
          body: JSON.stringify({ sessionId: activeId, task }),
        });
        // Rate-limited / bad input: show the reason, don't fall back (the
        // fallback endpoint would just hit the same limit).
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

  // Delete a lab: wipe its server-side memory, then drop it from the list.
  const removeSession = useCallback(
    (id: string) => {
      fetch(`/api/memory?sessionId=${id}`, { method: "DELETE" }).catch(() => {});
      remove(id);
    },
    [remove],
  );

  // Export this lab's full memory as a Markdown file (client-side download).
  const exportLab = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${activeId}&limit=500`);
    if (!res.ok) return;
    const entries: MemoryEntry[] = (await res.json()).entries ?? [];
    const name = sessions.find((s) => s.id === activeId)?.name ?? activeId;
    const header = `# Northstar Labs — ${name}\n\n_Lab \`${activeId}\` · exported ${new Date().toLocaleString()}_\n`;
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

  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      {/* Desktop / tablet layout — hidden at phone widths where the chat-first
          MobileLabConsole takes over (see mobile-console.css). */}
      <div className="lx-desktop">
      <header className="lx-topbar">
        <div className="lx-topbar-inner lx-topbar-inner--slim">
          <RuntimePills runtime={runtime} trading={trading} />
          <SessionSwitcher
            sessions={sessions}
            activeId={activeId}
            onSwitch={setActive}
            onCreate={create}
            onRemove={removeSession}
          />
        </div>
      </header>

      <main className="lx-main">
        <div className="lx-head">
          <div>
            <h1 className="lx-title">Agent Operating System</h1>
            <p className="lx-sub">
              Multi-agent lab · {sessions.length}{" "}
              {sessions.length === 1 ? "lab" : "labs"}
            </p>
          </div>
          <Link href="/" className="lx-tour">
            ← Home
          </Link>
        </div>

        <Connections />

        {agents.length === 0 ? <RosterSkeleton /> : (
          <AgentRoster agents={agents} statuses={statuses} />
        )}

        <div className="lx-grid">
          <Chat
            turns={turns}
            busy={busy}
            onSend={send}
            tradingEnabled={trading?.traderInCrew ?? false}
          />
          <div className="lx-mem-pane">
            <MemoryPanel
              entries={memory}
              onClear={clearMemory}
              onExplore={() => setExplorerOpen(true)}
              onExport={exportLab}
            />
          </div>
        </div>

        {/* On narrow screens the memory rail is hidden — keep shared memory
            reachable through the explorer instead of dropping the feature. */}
        <button
          type="button"
          className="lx-mem-mobile"
          onClick={() => setExplorerOpen(true)}
        >
          <MemoryGlyph />
          Shared memory
          <span className="lx-mem-mobile-count">
            {memory.length} {memory.length === 1 ? "entry" : "entries"}
          </span>
        </button>
      </main>
      </div>

      <MobileLabConsole
        turns={turns}
        busy={busy}
        onSend={send}
        statuses={statuses}
        memory={memory}
      />

      <MemoryExplorer
        sessionId={activeId}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </div>
  );
}

function RuntimePills({
  runtime,
  trading,
}: {
  runtime: RuntimeInfo | null;
  trading: TradingInfo | null;
}) {
  // Waking up: show quiet placeholders instead of misleading "off" states.
  if (!runtime) {
    return (
      <div className="lx-pills" aria-label="Checking runtime status">
        <Skeleton width={92} height={27} style={{ borderRadius: 999 }} />
        <Skeleton width={98} height={27} style={{ borderRadius: 999 }} className="opt" />
        <Skeleton width={88} height={27} style={{ borderRadius: 999 }} className="opt" />
      </div>
    );
  }
  const llmLive = runtime.configured;
  const memLive = runtime.memory === "supabase";
  const traderLive = trading?.traderInCrew ?? false;
  return (
    <div className="lx-pills">
      <span className="lx-pill" title={runtime.model ?? "model"}>
        <span className={`lx-dot ${llmLive ? "on" : "off"}`} />
        <b>{runtime.provider ?? "no model"}</b>
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${memLive ? "on" : "off"}`} />
        {memLive ? "Supabase" : "In-memory"}
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${traderLive ? "on" : "off"}`} />
        Trader {traderLive ? "live" : "off"}
      </span>
    </div>
  );
}

// Placeholder cards while /api/agents wakes the roster.
function RosterSkeleton() {
  return (
    <div className="lx-roster" aria-label="Waking the roster…" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lx-agent" aria-hidden="true">
          <div className="lx-agent-top">
            <Skeleton width={28} height={28} style={{ borderRadius: 9 }} />
            <Skeleton width={40} height={10} />
          </div>
          <Skeleton width="60%" height={13} style={{ marginTop: 14 }} />
          <Skeleton width="45%" height={10} style={{ marginTop: 6 }} />
          <Skeleton width="90%" height={10} style={{ marginTop: 10 }} />
          <Skeleton width="75%" height={10} style={{ marginTop: 5 }} />
        </div>
      ))}
    </div>
  );
}

function MemoryGlyph() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 5v14" />
    </svg>
  );
}
