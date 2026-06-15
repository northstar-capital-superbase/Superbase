"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  StudyAgentMesh,
  StudyCapitalFlow,
  StudyCommand,
  StudyNorthStar,
  StudyPortfolioOS,
  StudyRouting,
} from "../art";
import { Arrow } from "../icons";
import type { StudioSection } from "../types";
import { useReveal } from "../utils";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      className={`nx-section nx-reveal ${shown ? "is-shown" : ""} ${className}`}
    >
      <div className="nx-container">{children}</div>
    </section>
  );
}

// ── The live system console ────────────────────────────────────────────────
type Log = { id: number; t: string; tag: string; c: string; m: string };

const SCRIPT: Omit<Log, "id">[] = [
  { t: "09:41:02", tag: "OBJECTIVE", c: "#cfd9ff", m: "Grow surplus — never breach the 6-month buffer" },
  { t: "09:41:02", tag: "ORCHESTRATOR", c: "#8aa6ff", m: "Plan drafted · delegating to 4 specialists" },
  { t: "09:41:03", tag: "RESEARCH", c: "#5bd6a8", m: "Constraints compiled · 3 prior decisions recalled" },
  { t: "09:41:04", tag: "STRATEGIST", c: "#9db4ff", m: "Sequenced: trim VXUS → add VOO / QQQM" },
  { t: "09:41:05", tag: "BEHAVIORAL", c: "#e2b17c", m: "Stress-tested · drift risk within tolerance" },
  { t: "09:41:06", tag: "TRADER", c: "#6e8bff", m: "Conviction 78% · BUY NVDA ×2 @ 130.80 — filled" },
  { t: "09:41:07", tag: "ROUTER", c: "#8aa6ff", m: "Routed $400 surplus → brokerage core" },
  { t: "09:41:08", tag: "SYNTHESIS", c: "#5bd6a8", m: "Answer ready · full agent trace attached" },
];

function LiveConsole() {
  const counter = useRef(SCRIPT.length);
  const [lines, setLines] = useState<Log[]>(() =>
    SCRIPT.slice(0, 5).map((l, i) => ({ ...l, id: i })),
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLines(SCRIPT.map((l, i) => ({ ...l, id: i })));
      return;
    }
    const id = setInterval(() => {
      setLines((prev) => {
        const src = SCRIPT[counter.current % SCRIPT.length];
        counter.current += 1;
        return [...prev, { ...src, id: counter.current }].slice(-6);
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="nx-console nx-glowpulse">
      <div className="nx-console-bar">
        <span className="nx-console-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="nx-console-title">northstar · run trace</span>
        <span className="nx-console-live">
          <span className="nx-live" /> LIVE
        </span>
      </div>
      <div className="nx-console-body">
        {lines.map((l, i) => (
          <div className="nx-console-line" key={l.id}>
            <span className="nx-console-time">{l.t}</span>
            <span className="nx-console-tag" style={{ color: l.c }}>
              {l.tag}
            </span>
            <span className="nx-console-msg">
              {l.m}
              {i === lines.length - 1 && <span className="nx-cursor" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How it works (interactive stepper) ──────────────────────────────────────
const STEPS = [
  { n: "01", tag: "INTENT", title: "You set the objective", body: "Hand Northstar a goal in plain language. It reads intent, not commands — no scripts, no rules engine.", Comp: StudyCommand, caption: "Operator console", coord: "INTENT CAPTURED" },
  { n: "02", tag: "PLAN", title: "The orchestrator delegates", body: "It drafts a plan and splits the work across four specialist agents, each accountable for one part.", Comp: StudyNorthStar, coord: "PLAN · 4 AGENTS", caption: "Objective lock" },
  { n: "03", tag: "REASON", title: "Agents reason in shared memory", body: "Research, Strategist and Behavioral build on one another through a single memory every agent reads and writes.", Comp: StudyAgentMesh, coord: "CONSENSUS 100%", caption: "Decision mesh" },
  { n: "04", tag: "EXECUTE", title: "The trader acts with conviction", body: "Robinhood Agentic places orders within your caps — with a live confidence read and notes on every move.", Comp: StudyRouting, coord: "Δ 12MS", caption: "Order routing" },
  { n: "05", tag: "ROUTE", title: "Capital is put to work", body: "Surplus is routed, positions rebalance to target, and your buffers stay intact — automatically.", Comp: StudyCapitalFlow, coord: "5 STAGES", caption: "Capital flow" },
  { n: "06", tag: "SYNTHESIZE", title: "One answer, fully traced", body: "The OS returns a single synthesis with the complete trail of everything the crew did to get there.", Comp: StudyPortfolioOS, coord: "TRACE COMPLETE", caption: "Portfolio OS" },
];

function HowItWorks() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4200);
    return () => clearInterval(id);
  }, [step]);

  const active = STEPS[step];
  const Visual = active.Comp;

  return (
    <div className="nx-hw">
      <div className="nx-hw-steps">
        {STEPS.map((s, i) => (
          <button
            key={s.n}
            type="button"
            className={`nx-hw-step ${i === step ? "is-active" : ""}`}
            onClick={() => setStep(i)}
            aria-pressed={i === step}
          >
            <span className="nx-hw-num">{s.n}</span>
            <span>
              <span className="nx-hw-step-tag">{s.tag}</span>
              <span className="nx-hw-step-t">{s.title}</span>
              <span className="nx-hw-step-b">{s.body}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="nx-hw-stage">
        <div className="nx-hw-visual" key={active.n}>
          <Visual />
        </div>
        <div className="nx-hw-meta">
          <span className="nx-hw-meta-t">{active.caption}</span>
          <span className="nx-hw-meta-c">{active.coord}</span>
        </div>
        <div className="nx-hw-progress" aria-hidden="true">
          {STEPS.map((s, i) => (
            <i key={s.n} className={i === step ? "on" : ""} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── The three surfaces ──────────────────────────────────────────────────────
const SURFACES: { go: StudioSection; tag: string; name: string; body: string; cta: string }[] = [
  { go: "overview", tag: "PLATFORM", name: "Northstar OS", body: "The hub where capital is allocated, tracked, and routed — your whole financial system in one view.", cta: "Open the OS" },
  { go: "robinhood", tag: "TRADING", name: "Robinhood Agentic", body: "An agent that trades your account, shows its notes, and reads its own confidence before every order.", cta: "Open the desk" },
  { go: "labs", tag: "RESEARCH", name: "Northstar Labs", body: "The multi-agent lab where new architectures, memory, and allocation logic are proven before they ship.", cta: "Enter the lab" },
];

// ── AI-art finale ───────────────────────────────────────────────────────────
const ART = [
  { Comp: StudyAgentMesh, label: "CONSENSUS", caption: "Agents converging on one decision", coord: "AGENTS 7 · 100%" },
  { Comp: StudyCapitalFlow, label: "FLOW", caption: "Capital moving through five stages", coord: "INCOME → RESERVE" },
  { Comp: StudyNorthStar, label: "NORTH STAR", caption: "The long-term objective, held", coord: "OBJECTIVE · ∞" },
];

export function Landing({
  onNavigate,
}: {
  onNavigate: (s: StudioSection) => void;
}) {
  return (
    <div className="nx-stage">
      {/* Hero */}
      <section className="nx-hero is-center">
        <div className="nx-container">
          <span className="nx-hero-pill">
            <span className="nx-live" /> Autonomous capital · live run trace
          </span>
          <h1 className="nx-h1">
            Watch a financial system{" "}
            <span className="nx-grad">think for itself.</span>
          </h1>
          <p className="nx-lede">
            Northstar turns one objective into a coordinated crew of agents that
            research, decide, and execute — every move observable, every decision
            accountable. Here&apos;s the whole machine, working.
          </p>
          <div className="nx-hero-cta">
            <button
              type="button"
              className="nx-btn nx-btn-aurora nx-glowpulse"
              onClick={() => onNavigate("robinhood")}
            >
              See the trading agent <Arrow />
            </button>
            <button
              type="button"
              className="nx-btn nx-btn-ghost"
              onClick={() => onNavigate("overview")}
            >
              Enter the OS <Arrow />
            </button>
          </div>

          <LiveConsole />
        </div>
      </section>

      {/* How it works */}
      <Reveal>
        <div className="nx-head">
          <span className="nx-eyebrow">HOW IT WORKS</span>
          <h2 className="nx-h2">One objective, end to end.</h2>
          <p className="nx-lede">
            Six steps from intent to executed result. Follow along — or tap any
            step to see that part of the system at work.
          </p>
        </div>
        <HowItWorks />
      </Reveal>

      {/* The surfaces */}
      <Reveal>
        <div className="nx-head">
          <span className="nx-eyebrow">THE SURFACES</span>
          <h2 className="nx-h2">Three ways into the same system.</h2>
          <p className="nx-lede">
            One architecture, three places to work it — a platform to run it, a
            desk to trade it, and a lab to advance it.
          </p>
        </div>
        <div className="nx-pillars">
          {SURFACES.map((s, i) => (
            <article key={s.name} className="nx-pillar">
              <div className="nx-pillar-top">
                <span className="nx-mono">{s.tag}</span>
                <span className="nx-mono">0{i + 1}</span>
              </div>
              <h3 className="nx-pillar-name">{s.name}</h3>
              <p className="nx-pillar-body">{s.body}</p>
              <button
                type="button"
                className="nx-pillar-link"
                onClick={() => onNavigate(s.go)}
              >
                {s.cta} <Arrow />
              </button>
            </article>
          ))}
        </div>
      </Reveal>

      {/* AI-art finale */}
      <Reveal>
        <div className="nx-head">
          <span className="nx-eyebrow">RENDERED IN MOTION</span>
          <h2 className="nx-h2">A few studies of the machine.</h2>
          <p className="nx-lede">
            Generative, living renderings of the system underneath — drawn from
            the same signals that drive it.
          </p>
        </div>
        <div className="nx-gallery">
          {ART.map(({ Comp, label, caption, coord }) => (
            <figure key={label}>
              <div className="nx-art-frame">
                <Comp />
                <span className="nx-art-corner tl" aria-hidden="true" />
                <span className="nx-art-corner br" aria-hidden="true" />
              </div>
              <figcaption className="nx-art-cap">
                <span className="nx-art-label">{label}</span>
                <span className="nx-art-caption">{caption}</span>
                <span className="nx-art-coord">{coord}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <section className="nx-cta">
        <div className="nx-cta-glow" aria-hidden="true" />
        <div className="nx-container nx-cta-inner">
          <h2 className="nx-h2">Give your capital a mind of its own.</h2>
          <button
            type="button"
            className="nx-btn nx-btn-aurora nx-btn-lg nx-glowpulse"
            onClick={() => onNavigate("robinhood")}
          >
            Enter Northstar <Arrow />
          </button>
          <p className="nx-note">Northstar OS · currently in private development</p>
        </div>
      </section>
    </div>
  );
}
