"use client";

import type { ReactNode } from "react";
import { CapitalFlow } from "../art";
import { Arrow, Glyph } from "../icons";
import type { GlyphKind, StudioSection } from "../types";
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

const PILLARS: {
  tag: string;
  name: string;
  body: string;
  go?: StudioSection;
  cta?: string;
}[] = [
  {
    tag: "PLATFORM",
    name: "Northstar OS",
    body: "The operating system where capital is allocated, routed, and put to work by intelligent systems.",
    go: "overview",
    cta: "Open the OS",
  },
  {
    tag: "TRADING",
    name: "Robinhood Agentic",
    body: "An agent that trades your account — with viewable notes, live status, and a confidence read on every move.",
    go: "robinhood",
    cta: "Open the desk",
  },
  {
    tag: "RESEARCH",
    name: "Northstar Labs",
    body: "Where new agent architectures, memory models, and allocation logic are proven before they ship.",
    go: "labs",
    cta: "Enter the lab",
  },
];

const FEATURES: { kind: GlyphKind; title: string; body: string }[] = [
  {
    kind: "agents",
    title: "Multi-Agent Systems",
    body: "Specialized agents that reason, coordinate, and act — each accountable for a part of the whole.",
  },
  {
    kind: "portfolio",
    title: "Portfolio Intelligence",
    body: "Continuous analysis across every position, account, and time horizon.",
  },
  {
    kind: "workflows",
    title: "Autonomous Workflows",
    body: "Define the intent. The system handles execution, monitoring, and correction.",
  },
  {
    kind: "memory",
    title: "Shared Memory",
    body: "Durable, queryable context that every agent reads from and writes to.",
  },
  {
    kind: "orchestration",
    title: "Orchestration Layer",
    body: "The control plane that routes capital, resolves conflicts, and keeps the system in sync.",
  },
  {
    kind: "infra",
    title: "Financial Infrastructure",
    body: "Accounts, ledgers, and rails — modeled as one coherent system of record.",
  },
];

export function Landing({
  onNavigate,
}: {
  onNavigate: (s: StudioSection) => void;
}) {
  return (
    <div className="nx-stage">
      {/* Hero */}
      <section className="nx-hero">
        <div className="nx-container">
          <span className="nx-hero-pill">
            <span className="nx-live" /> <b>Robinhood Agentic</b> · now live in
            the OS
          </span>
          <h1 className="nx-h1">
            The operating system for{" "}
            <span className="nx-grad">autonomous finance</span>
          </h1>
          <p className="nx-lede">
            Build, orchestrate, and scale intelligent financial systems —
            capital routed, traded, and put to work, automatically.
          </p>
          <div className="nx-hero-cta">
            <button
              type="button"
              className="nx-btn nx-btn-aurora"
              onClick={() => onNavigate("overview")}
            >
              Launch Northstar <Arrow />
            </button>
            <button
              type="button"
              className="nx-btn nx-btn-ghost"
              onClick={() => onNavigate("robinhood")}
            >
              Meet the trading agent <Arrow />
            </button>
          </div>

          <div className="nx-hero-stats">
            {[
              ["4", "Specialist agents"],
              ["78%", "Live conviction"],
              ["0", "API keys to start"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="nx-hero-stat-n">{n}</div>
                <div className="nx-hero-stat-l">{l}</div>
              </div>
            ))}
          </div>

          {/* OS preview */}
          <div className="nx-preview">
            <div className="nx-preview-bar">
              <span>NORTHSTAR OS</span>
              <span>
                <span className="nx-live" /> CAPITAL ROUTING · LIVE
              </span>
            </div>
            <div className="nx-preview-screen">
              <CapitalFlow />
            </div>
          </div>
        </div>
      </section>

      {/* Structure */}
      <Reveal>
        <div className="nx-head">
          <span className="nx-eyebrow">THE STRUCTURE</span>
          <h2 className="nx-h2">One architecture. Three disciplines.</h2>
          <p className="nx-lede">
            Northstar is built as a system, not a product line. Each part holds
            a clear mandate, and they compound into something durable.
          </p>
        </div>
        <div className="nx-pillars">
          {PILLARS.map((p, i) => (
            <article key={p.name} className="nx-pillar">
              <div className="nx-pillar-top">
                <span className="nx-mono">{p.tag}</span>
                <span className="nx-mono">0{i + 1}</span>
              </div>
              <h3 className="nx-pillar-name">{p.name}</h3>
              <p className="nx-pillar-body">{p.body}</p>
              {p.go && (
                <button
                  type="button"
                  className="nx-pillar-link"
                  onClick={() => onNavigate(p.go!)}
                >
                  {p.cta} <Arrow />
                </button>
              )}
            </article>
          ))}
        </div>
      </Reveal>

      {/* Features */}
      <Reveal>
        <div className="nx-head">
          <span className="nx-eyebrow">THE PLATFORM</span>
          <h2 className="nx-h2">Everything capital needs to run itself.</h2>
          <p className="nx-lede">
            Six systems, one runtime. Composable, observable, and built to
            allocate without a person in the loop for every decision.
          </p>
        </div>
        <div className="nx-features">
          {FEATURES.map((f) => (
            <article key={f.title} className="nx-feature">
              <span className="nx-feature-glyph">
                <Glyph kind={f.kind} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <section className="nx-cta">
        <div className="nx-cta-glow" aria-hidden="true" />
        <div className="nx-container nx-cta-inner">
          <h2 className="nx-h2">Build systems that outlast decisions.</h2>
          <button
            type="button"
            className="nx-btn nx-btn-aurora nx-btn-lg"
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
