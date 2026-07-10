"use client";

import { memo, useEffect, useRef } from "react";
import { type CrewRun } from "@/components/shared";
import { EmptyState } from "@/components/ui";
import { Composer } from "@/components/labs/Composer";
import { MessageThread } from "@/components/labs/MessageThread";

export interface Attachment {
  id: string;
  kind: "image" | "file";
  name: string;
  size: number;
  dataUrl?: string; // present for images (client-side preview only)
}

export interface SendOptions {
  attachments?: Attachment[];
  webSearch?: boolean;
}

export type SendFn = (text: string, opts?: SendOptions) => void;

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  run?: CrewRun; // present on assistant turns
  attachments?: Attachment[]; // present on user turns
  webSearch?: boolean; // user asked with the web-search plugin on
}

export const Chat = memo(function Chat({
  turns,
  busy,
  onSend,
  tradingEnabled = false,
}: {
  turns: ChatTurn[];
  busy: boolean;
  onSend: SendFn;
  tradingEnabled?: boolean;
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

  return (
    <div className="lx-card lx-pane">
      <div className="lx-card-head">
        <div className="lx-card-title">
          <span className="lx-dot on" />
          Lab Console
        </div>
        <span className="lx-card-sub">orchestrated multi-agent chat</span>
      </div>

      <div
        ref={scrollRef}
        className="lx-scroll"
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {turns.length === 0 && (
          <ConsoleEmptyState onPick={onSend} tradingEnabled={tradingEnabled} />
        )}
        <MessageThread turns={turns} variant="desktop" />
        {busy && <Thinking />}
      </div>

      <div className="lx-console-foot">
        <Composer
          onSend={onSend}
          busy={busy}
          variant="desktop"
          placeholder="Give the lab a task…  (Enter to send, Shift+Enter for newline)"
        />
      </div>
    </div>
  );
});

function Thinking() {
  return (
    <div className="lx-thinking" role="status" aria-live="polite">
      <span
        className="lx-dot lx-pulse"
        style={{ background: "var(--blue-bright)" }}
      />
      crew is collaborating…
    </div>
  );
}

const SAMPLES = [
  "Design a go-to-market plan for a local-first AI note app",
  "Should we migrate our monolith to microservices?",
  "Plan a 3-month roadmap for an open-source dev tool",
];

const TRADING_SAMPLES = [
  "What is my Agentic account balance and top holdings?",
  "Should I add $50 to VOO this week given my buffer target?",
  "Summarize portfolio drift vs my 55/25/20 allocation",
];

function ConsoleEmptyState({
  onPick,
  tradingEnabled,
}: {
  onPick: (t: string) => void;
  tradingEnabled: boolean;
}) {
  const samples = tradingEnabled ? TRADING_SAMPLES : SAMPLES;
  return (
    <EmptyState
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
            fill="currentColor"
          />
        </svg>
      }
      title="Northstar Labs is ready"
      description={
        tradingEnabled
          ? "Robinhood MCP is connected — the Trader joins every crew run. Ask for portfolio analysis or execution within your policy caps."
          : "Hand the orchestrator a task. It plans, delegates to the Research, Strategist, and Behavioral agents, then synthesizes their work."
      }
    >
      <div className="lx-samples">
        {samples.map((s) => (
          <button key={s} className="lx-sample" onClick={() => onPick(s)}>
            {s}
          </button>
        ))}
      </div>
    </EmptyState>
  );
}
