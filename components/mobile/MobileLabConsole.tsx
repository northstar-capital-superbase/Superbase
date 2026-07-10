"use client";

import { useEffect, useRef } from "react";
import { MemoryContextChip } from "./MemoryContextChip";
import { Composer } from "@/components/labs/Composer";
import { AgentsPanel } from "@/components/labs/AgentsPanel";
import { MessageThread, NorthstarMark } from "@/components/labs/MessageThread";
import type { ChatTurn, SendFn } from "@/components/chat/Chat";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import type { AgentProfile, MemoryEntry } from "@/components/shared";
import "./mobile-console.css";

// Chat-first mobile lab console. The crew (Agents panel) is shown inline at the
// top of the thread with live status, and Shared Memory opens the full Memory
// Explorer via the context chip. Desktop keeps its own layout; this component is
// only shown at phone widths (see mobile-console.css). Bubbles and the agent
// trace come from the shared MessageThread.
export function MobileLabConsole({
  turns,
  busy,
  onSend,
  statuses,
  memory,
  agents,
  tradingEnabled = false,
  onNewChat,
  onOpenHistory,
  onOpenMemory,
}: {
  turns: ChatTurn[];
  busy: boolean;
  onSend: SendFn;
  statuses: Record<string, AgentStatus>;
  memory: MemoryEntry[];
  agents: AgentProfile[];
  tradingEnabled?: boolean;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onOpenMemory: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce =
      typeof document !== "undefined" &&
      document.documentElement.dataset.motion === "reduced";
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [turns, busy]);

  const memoryCount = memory.length;

  return (
    <div className="mlc" aria-label="Lab Console">
      <header className="mlc-head">
        <span className="mlc-title">Lab Console</span>
        <div className="mlc-head-actions">
          <button
            type="button"
            className="mlc-head-btn"
            onClick={onOpenHistory}
            aria-label="Chat history"
            title="Chat history"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 4v4h4M12 8v4l3 2" />
            </svg>
          </button>
          <button
            type="button"
            className="mlc-head-btn"
            onClick={onNewChat}
            aria-label="New chat"
            title="New chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mlc-scroll" ref={scrollRef}>
        <AgentsPanel
          agents={agents}
          statuses={statuses}
          busy={busy}
          tradingEnabled={tradingEnabled}
          variant="mobile"
          collapsible
        />
        {turns.length === 0 ? (
          <MobileEmptyState onPick={onSend} tradingEnabled={tradingEnabled} />
        ) : (
          <div className="mlc-thread">
            <MessageThread turns={turns} variant="mobile" />
          </div>
        )}
      </div>

      <div className="mlc-foot">
        <div className="mlc-foot-rail">
          <MemoryContextChip count={memoryCount} onOpen={onOpenMemory} />
        </div>

        <Composer onSend={onSend} busy={busy} variant="mobile" />
      </div>
    </div>
  );
}

const MLC_SAMPLES = [
  "Plan a 3-month roadmap for an open-source dev tool",
  "Should we migrate our monolith to microservices?",
];
const MLC_TRADING_SAMPLES = [
  "What is my Agentic account balance and top holdings?",
  "Summarize portfolio drift vs my 55/25/20 allocation",
];

function MobileEmptyState({
  onPick,
  tradingEnabled,
}: {
  onPick: (t: string) => void;
  tradingEnabled: boolean;
}) {
  const samples = tradingEnabled ? MLC_TRADING_SAMPLES : MLC_SAMPLES;
  return (
    <div className="mlc-empty">
      <span className="mlc-empty-mark" aria-hidden="true">
        <NorthstarMark size={18} dot />
      </span>
      <h2 className="mlc-empty-title">How can the lab help?</h2>
      <p className="mlc-empty-sub">
        Hand the crew a task. Agents and shared memory stay tucked away until you
        need them.
      </p>
      <div className="mlc-empty-samples">
        {samples.map((s) => (
          <button key={s} className="mlc-empty-sample" onClick={() => onPick(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
