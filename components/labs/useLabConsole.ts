"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Attachment, ChatTurn, SendOptions } from "@/components/chat/Chat";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import {
  type AgentProfile,
  type CrewEvent,
  type CrewRun,
  type MemoryEntry,
  pipelineAgentIds,
  type RuntimeInfo,
  type TradingInfo,
} from "@/components/shared";
import {
  deleteTranscript,
  deriveChatTitle,
  loadTranscript,
  saveTranscript,
  useChatHistory,
} from "./useChatHistory";

// Rebuild a transcript from persisted memory (used only when explicitly
// reopening a chat from history — never on first load).
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

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Session-based orchestration for the Lab Console (AI chat). Unlike the Command
// Center dashboard, this ALWAYS starts on a fresh chat and never auto-loads the
// last conversation — previous chats are reachable only via history. All calls
// hit the existing endpoints; no backend/API changes.
export function useLabConsole() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [trading, setTrading] = useState<TradingInfo | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [busy, setBusy] = useState(false);
  // Fresh chat by default: a brand-new session id, empty transcript.
  const [activeChatId, setActiveChatId] = useState<string>(() => newId());

  const { history, addChat, removeChat } = useChatHistory();
  // Whether the current chat has been recorded in history yet (on first send).
  const registered = useRef(false);

  const pipelineFlow = useMemo(
    () => pipelineAgentIds(trading?.traderInCrew ?? false),
    [trading?.traderInCrew],
  );

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

  const refreshMemory = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${activeChatId}`);
    if (res.ok) setMemory((await res.json()).entries ?? []);
  }, [activeChatId]);

  // Persist the active chat's transcript locally so it can be reopened from
  // history even though the default in-memory backend doesn't retain it.
  useEffect(() => {
    if (registered.current && turns.length > 0) saveTranscript(activeChatId, turns);
  }, [turns, activeChatId]);

  // Start a brand-new chat: new session, cleared transcript/memory/statuses.
  const newChat = useCallback(() => {
    setActiveChatId(newId());
    setTurns([]);
    setMemory([]);
    setStatuses({});
    registered.current = false;
  }, []);

  // Explicitly reopen a previous chat from history. Prefer the locally saved
  // transcript; fall back to reconstructing from server memory if present.
  const openChat = useCallback(async (id: string) => {
    setActiveChatId(id);
    setStatuses({});
    registered.current = true;
    const local = loadTranscript(id);
    let entries: MemoryEntry[] = [];
    try {
      const res = await fetch(`/api/memory?sessionId=${id}&limit=300`);
      entries = res.ok ? ((await res.json()).entries ?? []) : [];
    } catch {
      entries = [];
    }
    setMemory(entries.slice(-50));
    setTurns(local.length > 0 ? local : reconstructTurns(entries));
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      fetch(`/api/memory?sessionId=${id}`, { method: "DELETE" }).catch(() => {});
      deleteTranscript(id);
      removeChat(id);
      if (id === activeChatId) newChat();
    },
    [removeChat, activeChatId, newChat],
  );

  const pushAssistant = useCallback(
    (content: string, run?: CrewRun) =>
      setTurns((t) => [
        ...t,
        { id: newId(), role: "assistant", content, run },
      ]),
    [],
  );

  const runFallback = useCallback(
    async (task: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeChatId, task }),
      });
      const data = (await res.json()) as CrewRun & { error?: string };
      setStatuses(Object.fromEntries(pipelineFlow.map((id) => [id, "done"])));
      if (!res.ok || data.error) pushAssistant(`⚠️ ${data.error ?? "Run failed."}`);
      else pushAssistant(data.synthesis.output, data);
    },
    [pushAssistant, activeChatId, pipelineFlow],
  );

  const send = useCallback(
    async (task: string, opts?: SendOptions) => {
      const attachments: Attachment[] = opts?.attachments ?? [];
      const webSearch = opts?.webSearch ?? false;

      // Record this chat in history on its first message.
      if (!registered.current) {
        const title = deriveChatTitle(
          task || attachments[0]?.name || "New chat",
        );
        addChat({
          id: activeChatId,
          title,
          createdAt: new Date().toISOString(),
        });
        registered.current = true;
      }

      setBusy(true);
      setTurns((t) => [
        ...t,
        {
          id: newId(),
          role: "user",
          content: task,
          attachments: attachments.length ? attachments : undefined,
          webSearch: webSearch || undefined,
        },
      ]);
      setStatuses({ orchestrator: "thinking" });

      // Enrich the task the crew receives with plugin/attachment context so the
      // model can reference them. No API change — it's still a plain task string.
      const context: string[] = [];
      if (webSearch) {
        context.push(
          "[Plugin enabled: Web search — you may cite up-to-date web sources.]",
        );
      }
      if (attachments.length) {
        const list = attachments
          .map((a) => `${a.kind === "image" ? "image" : "file"}: ${a.name}`)
          .join(", ");
        context.push(`[User attached ${attachments.length} item(s): ${list}]`);
      }
      const apiTask = context.length
        ? `${task}\n\n${context.join("\n")}`.trim()
        : task;

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: activeChatId, task: apiTask }),
        });
        if (res.status === 429 || res.status === 400) {
          const d = await res.json().catch(() => ({}));
          pushAssistant(`⚠️ ${d.error ?? "Request rejected."}`);
          return;
        }
        if (!res.ok || !res.body) {
          await runFallback(apiTask);
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

        if (!finished) await runFallback(apiTask);
      } catch (err) {
        pushAssistant(`⚠️ ${err instanceof Error ? err.message : "Network error"}`);
      } finally {
        setBusy(false);
        await refreshMemory();
        setTimeout(() => setStatuses({}), 1200);
      }
    },
    [pushAssistant, refreshMemory, runFallback, activeChatId, addChat],
  );

  return {
    agents,
    runtime,
    trading,
    turns,
    memory,
    statuses,
    busy,
    activeChatId,
    history,
    send,
    newChat,
    openChat,
    deleteChat,
  };
}
