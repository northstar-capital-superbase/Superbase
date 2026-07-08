"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgentActivityPill } from "./AgentActivityPill";
import { SystemActivitySheet } from "./SystemActivitySheet";
import { MemoryContextChip } from "./MemoryContextChip";
import { SharedMemorySheet } from "./SharedMemorySheet";
import { crewAgents, toMemoryRows } from "./mobileData";
import { Composer } from "@/components/labs/Composer";
import { MessageContent } from "@/components/labs/MessageContent";
import { MessageAttachments } from "@/components/labs/MessageAttachments";
import type { ChatTurn, SendFn } from "@/components/chat/Chat";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import type { AgentProfile, MemoryEntry } from "@/components/shared";
import "./mobile-console.css";

// Chat-first mobile lab console. Agents and shared memory are not permanent
// sections — they surface as bottom sheets on demand (System Activity via the
// working pill, Shared Memory via the context chip). Desktop keeps its own
// layout; this component is only shown at phone widths (see mobile-console.css).
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
}) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const crew = useMemo(
    () => crewAgents(agents, tradingEnabled),
    [agents, tradingEnabled],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, busy]);

  const memoryCount = toMemoryRows(memory).length;

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
        {turns.length === 0 ? (
          <MobileEmptyState onPick={onSend} />
        ) : (
          <div className="mlc-thread">
            {turns.map((t) =>
              t.role === "user" ? (
                <div className="mlc-bubble mlc-bubble--user" key={t.id}>
                  <div className="mlc-user-inner">
                    {t.attachments && <MessageAttachments items={t.attachments} />}
                    {t.content && <span className="mlc-user-text">{t.content}</span>}
                    {t.webSearch && (
                      <span className="msg-plugin-tag">
                        <SearchGlyph /> Web search
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mlc-bubble mlc-bubble--ai ai-turn" key={t.id}>
                  <span className="ai-avatar" aria-hidden="true">
                    <NorthstarMark />
                  </span>
                  <div className="ai-body">
                    <div className="ai-name">Northstar</div>
                    <MessageContent text={t.content} />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <div className="mlc-foot">
        <div className="mlc-foot-rail">
          <MemoryContextChip count={memoryCount} onOpen={() => setMemoryOpen(true)} />
          {busy && (
            <AgentActivityPill count={crew.length} onOpen={() => setActivityOpen(true)} />
          )}
        </div>

        <Composer onSend={onSend} busy={busy} variant="mobile" />
      </div>

      <SystemActivitySheet
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        agents={crew}
        statuses={statuses}
        busy={busy}
      />
      <SharedMemorySheet
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        memory={memory}
      />
    </div>
  );
}

function MobileEmptyState({ onPick }: { onPick: (t: string) => void }) {
  const samples = [
    "Plan a 3-month roadmap for an open-source dev tool",
    "Should we migrate our monolith to microservices?",
  ];
  return (
    <div className="mlc-empty">
      <span className="mlc-empty-mark" aria-hidden="true">
        <NorthstarMark />
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

function SearchGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function NorthstarMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}
