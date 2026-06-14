"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CapitalFlow,
  StudyAgentMesh,
  StudyCapitalFlow,
  StudyCommand,
  StudyNorthStar,
  StudyPortfolioOS,
  StudyRouting,
} from "./art";
import { Arrow, Glyph, StarGlyph } from "./icons";
import type { GlyphKind } from "./types";
import { useReveal } from "./utils";

function Section({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const [ref, shown] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`ns-section ns-reveal ${shown ? "is-shown" : ""} ${className}`}
    >
      <div className="ns-container">{children}</div>
    </section>
  );
}

export function HomePage({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sc = rootRef.current;
    const onScroll = () =>
      setScrolled((sc ? sc.scrollTop : window.scrollY) > 24);
    (sc || window).addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setReady(true), 60);
    return () => {
      (sc || window).removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  const vision = [
    {
      tag: "INTELLIGENCE",
      name: "Dashboard",
      body: "Your AI Chief Investment Officer — briefing you on portfolio health, agent activity, and emerging opportunities every morning.",
      href: "/dashboard",
    },
    {
      tag: "EXECUTION",
      name: "Trading",
      body: "Robinhood Agentic account center — understand what the AI is doing with your capital, and why every decision was made.",
      href: "/trading",
    },
    {
      tag: "CREATION",
      name: "Labs",
      body: "The orchestration workspace. Build agents, run multi-agent crews, launch research, and create strategies.",
      href: "/labs",
    },
  ];

  const platform: { kind: GlyphKind; title: string; body: string }[] = [
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
      kind: "infra",
      title: "Financial Infrastructure",
      body: "Accounts, ledgers, and rails — modeled as one coherent system of record.",
    },
    {
      kind: "memory",
      title: "Shared Memory Systems",
      body: "Durable, queryable context that every agent reads from and writes to.",
    },
    {
      kind: "orchestration",
      title: "Orchestration Layer",
      body: "The control plane that routes capital, resolves conflicts, and keeps the system in sync.",
    },
  ];

  const art = [
    {
      Comp: StudyCapitalFlow,
      label: "CAPITAL FLOW",
      coord: "INCOME → RESERVE · 5 STAGES",
      caption: "Living capital flow",
    },
    {
      Comp: StudyAgentMesh,
      label: "AGENT COORDINATION",
      coord: "AGENTS 7 · CONSENSUS 100%",
      caption: "Decision mesh",
    },
    {
      Comp: StudyPortfolioOS,
      label: "PORTFOLIO OS",
      coord: "CORE 55 · GROWTH 25 · INTL 20",
      caption: "Allocation model",
    },
    {
      Comp: StudyRouting,
      label: "ROUTING SYSTEM",
      coord: "TRACES 9 · Δ 12MS",
      caption: "Intelligent routing",
    },
    {
      Comp: StudyCommand,
      label: "COMMAND SURFACE",
      coord: "OPS QUEUE · 3 PENDING",
      caption: "Operator console",
    },
    {
      Comp: StudyNorthStar,
      label: "NORTH STAR",
      coord: "OBJECTIVE · LONG-TERM",
      caption: "The guiding objective",
    },
  ];

  return (
    <div className={`ns-home ${ready ? "is-ready" : ""}`} ref={rootRef}>
      <header className={`ns-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="ns-container ns-nav-inner">
          <a href="#top" className="ns-brand">
            <StarGlyph />
            <span className="ns-brand-word">Northstar</span>
          </a>
          <nav className="ns-nav-links" aria-label="Primary">
            <a href="#platform">Platform</a>
            <a href="#vision">OS</a>
            <Link href="/labs">Labs</Link>
          </nav>
          <Link href="/dashboard" className="ns-btn ns-btn-ghost ns-nav-cta">
            Open Dashboard <Arrow />
          </Link>
        </div>
      </header>

      <section className="ns-hero" id="top" aria-labelledby="hero-title">
        <div className="ns-hero-bg" aria-hidden="true">
          <StarGlyph color="rgba(205,217,255,0.18)" size={14} />
        </div>
        <div className="ns-container ns-hero-inner">
          <p
            className="ns-eyebrow ns-fade"
            style={{ transitionDelay: "120ms" }}
          >
            NORTHSTAR CAPITAL · AUTONOMOUS FINANCE
          </p>
          <h1
            id="hero-title"
            className="ns-hero-title ns-fade"
            style={{ transitionDelay: "200ms" }}
          >
            The Operating System
            <br />
            for Autonomous Finance
          </h1>
          <p
            className="ns-hero-sub ns-fade"
            style={{ transitionDelay: "320ms" }}
          >
            Build, orchestrate, and scale intelligent financial systems — capital
            routed and put to work, automatically.
          </p>
          <div
            className="ns-hero-cta ns-fade"
            style={{ transitionDelay: "440ms" }}
          >
            <Link href="/dashboard" className="ns-btn ns-btn-primary">
              Open Dashboard <Arrow />
            </Link>
            <a href="#platform" className="ns-btn ns-btn-ghost">
              Explore platform <Arrow />
            </a>
          </div>
          <div
            className="ns-os-panel ns-fade"
            style={{ transitionDelay: "600ms" }}
          >
            <div className="ns-os-bar">
              <span className="ns-os-name">
                <StarGlyph color="#7d879c" size={12} /> NORTHSTAR OS
              </span>
              <span className="ns-os-status">
                <i className="ns-live" /> CAPITAL ROUTING · LIVE
              </span>
            </div>
            <div className="ns-os-screen">
              <CapitalFlow />
            </div>
          </div>
        </div>
      </section>

      <Section id="vision">
        <div className="ns-head">
          <span className="ns-eyebrow">THE OS</span>
          <h2 className="ns-h2">Every area. One system.</h2>
          <p className="ns-lede">
            Dashboard, Trading, Labs — each a different room in the same building.
            Every surface reads from the same intelligence layer.
          </p>
        </div>
        <div className="ns-vision-grid">
          {vision.map((v, i) => (
            <article
              key={v.name}
              id={v.name.includes("Labs") ? "labs" : undefined}
              className="ns-vision-card"
            >
              <div className="ns-vision-top">
                <span className="ns-mono-tag">{v.tag}</span>
                <span className="ns-mono-idx">0{i + 1}</span>
              </div>
              <h3 className="ns-vision-name">{v.name}</h3>
              <p className="ns-vision-body">{v.body}</p>
              {"href" in v && v.href && (
                <Link href={v.href} className="ns-vision-link">
                  Open {v.name} <Arrow />
                </Link>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section id="platform" className="ns-section-tight">
        <div className="ns-head">
          <span className="ns-eyebrow">THE PLATFORM</span>
          <h2 className="ns-h2">Everything capital needs to run itself.</h2>
          <p className="ns-lede">
            Six systems, one runtime. Composable, observable, and designed to
            allocate without a human in the loop for every decision.
          </p>
        </div>
        <div className="ns-platform-grid">
          {platform.map((p) => (
            <article key={p.title} className="ns-card">
              <span className="ns-card-glyph" aria-hidden="true">
                <Glyph kind={p.kind} />
              </span>
              <h3 className="ns-card-title">{p.title}</h3>
              <p className="ns-card-body">{p.body}</p>
              <span className="ns-card-arrow" aria-hidden="true">
                <Arrow />
              </span>
            </article>
          ))}
        </div>
      </Section>

      <Section id="art">
        <div className="ns-head">
          <span className="ns-eyebrow">THE SYSTEM</span>
          <h2 className="ns-h2">How money moves through Northstar.</h2>
          <p className="ns-lede">
            Studies from the system — how capital flows, how agents coordinate,
            how decisions route. Drag to explore.
          </p>
        </div>
        <div className="ns-art-rail" role="list">
          {art.map(({ Comp, label, coord, caption }) => (
            <figure className="ns-art-panel" role="listitem" key={label}>
              <div className="ns-art-frame">
                <Comp />
                <span
                  className="ns-art-corner ns-art-corner-tl"
                  aria-hidden="true"
                />
                <span
                  className="ns-art-corner ns-art-corner-br"
                  aria-hidden="true"
                />
              </div>
              <figcaption className="ns-art-cap">
                <span className="ns-art-label">{label}</span>
                <span className="ns-art-caption">{caption}</span>
                <span className="ns-art-coord">{coord}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <section className="ns-final" aria-labelledby="final-title">
        <div className="ns-final-art" aria-hidden="true">
          <svg
            viewBox="0 0 1200 520"
            preserveAspectRatio="xMidYMid slice"
            className="ns-final-svg"
          >
            <defs>
              <radialGradient id="fG" cx="50%" cy="44%" r="55%">
                <stop offset="0%" stopColor="#6E8BFF" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#06070A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="fS" x1="0" x2="1">
                <stop offset="0%" stopColor="#E2B17C" stopOpacity="0" />
                <stop offset="50%" stopColor="#E2B17C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E2B17C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="1200" height="520" fill="url(#fG)" />
            {[150, 210, 270, 330, 390].map((y, i) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="1200"
                y2={y}
                stroke="url(#fS)"
                strokeWidth="1.5"
                className="ns-stream"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </svg>
        </div>
        <div className="ns-container ns-final-inner">
          <h2 id="final-title" className="ns-final-title">
            Build systems that
            <br />
            outlast decisions.
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/dashboard" className="ns-btn ns-btn-primary ns-btn-lg">
              Open Dashboard <Arrow />
            </Link>
            <Link href="/labs" className="ns-btn ns-btn-ghost ns-btn-lg">
              Open Labs <Arrow />
            </Link>
          </div>
          <p className="ns-final-note">
            Northstar OS · Private beta
          </p>
        </div>
      </section>

      <footer className="ns-footer">
        <div className="ns-container ns-footer-inner">
          <div className="ns-footer-brand">
            <StarGlyph color="#7d879c" size={16} />
            <span>Northstar Capital</span>
          </div>
          <div className="ns-footer-cols">
            <div>
              <span className="ns-mono-tag">APP</span>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/trading">Trading</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/labs">Labs</Link>
              <Link href="/agents">Agents</Link>
              <Link href="/research">Research</Link>
              <Link href="/analytics">Analytics</Link>
            </div>
            <div>
              <span className="ns-mono-tag">PRODUCT</span>
              <a href="#vision">OS</a>
              <a href="#platform">Platform</a>
              <a href="#art">System</a>
              <Link href="/settings">Settings</Link>
            </div>
          </div>
          <div className="ns-footer-meta">
            <span>NORTHSTAR OS · BUILD 0.2</span>
            <span>© {new Date().getFullYear()} Northstar Capital</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
