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
    <div className="panel flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-signal-research" />
        <span className="text-sm font-semibold text-white">Lab Console</span>
        <span className="ml-auto text-[11px] text-slate-500">
          orchestrated multi-agent chat
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
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

      <div className="border-t border-white/5 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-white/5 bg-base-750/60 p-2 focus-within:border-accent/40">
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
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-base-900 transition enabled:hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent/15 px-3.5 py-2 text-sm text-slate-100">
        {text}
      </div>
    </div>
  );
}

function ConfidenceChip({ value }: { value?: number }) {
  const known = typeof value === "number";
  // Green when the OS is sure, amber mid, red low; grey when not stated.
  const color = !known
    ? "#64748b"
    : value >= 75
      ? "#34d399"
      : value >= 50
        ? "#fbbf24"
        : "#f87171";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px]"
      style={{ borderColor: `${color}55`, color }}
      title="The orchestrator's calibrated confidence in this recommendation"
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      {known ? `CONFIDENCE ${value}%` : "CONFIDENCE —"}
    </span>
  );
}

function AssistantBubble({ text, run }: { text: string; run?: CrewRun }) {
  const [open, setOpen] = useState(false);
  const confidence = run?.synthesis.confidence;
  const consequence = run?.synthesis.consequenceOfInaction;
  return (
    <div className="animate-fadeUp space-y-2">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/5 bg-base-750/70 px-3.5 py-2.5">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Orchestrator
          {run && <span className="ml-auto"><ConfidenceChip value={confidence} /></span>}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
          {text}
        </p>
        {run && (
          <div className="mt-2 flex gap-2 rounded-lg border border-white/5 bg-base-900/40 px-2.5 py-1.5">
            <span className="mt-px font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
              If you do nothing
            </span>
            <span className="text-[11px] leading-relaxed text-slate-300">
              {consequence ?? "Not stated by the orchestrator for this run."}
            </span>
          </div>
        )}
        {run && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2 text-[11px] text-slate-500 transition hover:text-slate-300"
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
    <div className="ml-2 max-w-[85%] space-y-2 border-l border-white/5 pl-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[10px] text-slate-500">
        <span>
          <span className="text-slate-400">{run.synthesis.model}</span>
        </span>
        <span>· {totalMs}ms total</span>
        {hasTokens && (
          <span>
            · {inTok + outTok} tok{" "}
            <span className="text-slate-600">
              ({inTok} in / {outTok} out)
            </span>
          </span>
        )}
        <span>· {run.specialistResults.length + 1} agent calls</span>
        {cost !== null && cost > 0 && (
          <span className="text-slate-400">· ~${cost.toFixed(4)}</span>
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
    <div className="panel-tight p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
      <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-400">
        {content}
      </p>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 text-[12px] text-slate-500">
      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-accent" />
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
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent shadow-glow">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold text-white">
          Northstar Labs is ready
        </div>
        <p className="mt-1 max-w-sm text-[12px] text-slate-500">
          {tradingEnabled
            ? "Trader is included in this run. It can read your account and advise; placing orders still requires the operating mode to permit it."
            : "Hand the orchestrator a task. It plans, delegates to the research, strategist, and behavioral agents, then synthesizes their work."}
        </p>
      </div>
      <div className="flex max-w-md flex-wrap justify-center gap-2">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full border border-white/5 px-3 py-1.5 text-[11px] text-slate-400 transition hover:border-accent/40 hover:text-slate-200"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
