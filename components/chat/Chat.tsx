"use client";

import { useEffect, useRef, useState } from "react";
import { AGENT_META, estimateCostUSD, type CrewRun } from "@/components/shared";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  run?: CrewRun; // present on assistant turns
}

export function Chat({
  turns,
  busy,
  onSend,
  tradingEnabled = false,
}: {
  turns: ChatTurn[];
  busy: boolean;
  onSend: (text: string) => void;
  tradingEnabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput("");
  };

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
          <EmptyState onPick={onSend} tradingEnabled={tradingEnabled} />
        )}
        {turns.map((t) =>
          t.role === "user" ? (
            <UserBubble key={t.id} text={t.content} />
          ) : (
            <AssistantBubble key={t.id} text={t.content} run={t.run} />
          ),
        )}
        {busy && <Thinking />}
      </div>

      <div className="lx-console-foot">
        <div className="lx-composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Give the lab a task…  (Enter to send, Shift+Enter for newline)"
          />
          <button
            className="lx-btn lx-btn-primary"
            onClick={submit}
            disabled={busy || !input.trim()}
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="lx-bubble-user">
      <span>{text}</span>
    </div>
  );
}

function AssistantBubble({ text, run }: { text: string; run?: CrewRun }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lx-fadeup">
      <div className="lx-bubble-ai">
        <div className="lx-bubble-ai-head">
          <span className="lx-dot" style={{ background: "var(--blue-bright)" }} />
          Orchestrator
        </div>
        <p>{text}</p>
        {run && (
          <button
            className="lx-trace-toggle"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide" : "Show"} agent trace ({run.specialistResults.length}{" "}
            specialists)
          </button>
        )}
      </div>
      {run && open && <AgentTrace run={run} />}
    </div>
  );
}

function AgentTrace({ run }: { run: CrewRun }) {
  const steps = [...run.specialistResults, run.synthesis];
  const totalMs = steps.reduce((a, r) => a + r.ms, 0);
  const inTok = steps.reduce((a, r) => a + (r.tokens?.input ?? 0), 0);
  const outTok = steps.reduce((a, r) => a + (r.tokens?.output ?? 0), 0);
  const hasTokens = inTok + outTok > 0;
  const cost = estimateCostUSD(run.synthesis.model, inTok, outTok);

  return (
    <div className="lx-trace">
      <div className="lx-trace-meta lx-mono">
        <span style={{ color: "var(--text-2)" }}>{run.synthesis.model}</span>
        <span>· {totalMs}ms total</span>
        {hasTokens && (
          <span>
            · {inTok + outTok} tok ({inTok} in / {outTok} out)
          </span>
        )}
        <span>· {run.specialistResults.length + 1} agent calls</span>
        {cost !== null && cost > 0 && (
          <span style={{ color: "var(--text-2)" }}>· ~${cost.toFixed(4)}</span>
        )}
      </div>
      <TraceStep author="orchestrator" label="Plan" content={run.plan} />
      {run.specialistResults.map((r) => (
        <TraceStep
          key={r.agent}
          author={r.agent}
          label={`${AGENT_META[r.agent].label} · ${r.ms}ms${
            r.tokens ? ` · ${r.tokens.input + r.tokens.output} tok` : ""
          }`}
          content={r.output}
        />
      ))}
    </div>
  );
}

function TraceStep({
  author,
  label,
  content,
}: {
  author: keyof typeof AGENT_META;
  label: string;
  content: string;
}) {
  const color = AGENT_META[author].color;
  return (
    <div className="lx-trace-step">
      <div className="lx-trace-step-h" style={{ color }}>
        <span className="lx-dot" style={{ backgroundColor: color }} />
        {label}
      </div>
      <p>{content}</p>
    </div>
  );
}

function Thinking() {
  return (
    <div className="lx-thinking">
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

function EmptyState({
  onPick,
  tradingEnabled,
}: {
  onPick: (t: string) => void;
  tradingEnabled: boolean;
}) {
  const samples = tradingEnabled ? TRADING_SAMPLES : SAMPLES;
  return (
    <div className="lx-empty">
      <div className="lx-empty-mark">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div>
        <h3>Northstar Labs is ready</h3>
        <p>
          {tradingEnabled
            ? "Robinhood MCP is connected — the Trader joins every crew run. Ask for portfolio analysis or execution within your policy caps."
            : "Hand the orchestrator a task. It plans, delegates to the research, strategist, and behavioral agents, then synthesizes their work."}
        </p>
      </div>
      <div className="lx-samples">
        {samples.map((s) => (
          <button key={s} className="lx-sample" onClick={() => onPick(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
