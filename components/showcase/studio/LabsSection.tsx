"use client";

import Link from "next/link";
import { StudyAgentMesh } from "../art";
import { Arrow } from "../icons";

const PIPELINE = [
  { n: "01", name: "Orchestrator", desc: "Drafts a delegation plan", role: "PLAN", color: "#6e8bff" },
  { n: "02", name: "Research", desc: "Surfaces facts, constraints, prior art", role: "GATHER", color: "#34d399" },
  { n: "03", name: "Strategist", desc: "Turns research into a sequenced plan", role: "SEQUENCE", color: "#a78bfa" },
  { n: "04", name: "Behavioral", desc: "Pressure-tests for failure modes", role: "CHECK", color: "#fbbf24" },
  { n: "05", name: "Trader", desc: "Robinhood Agentic — analysis & orders", role: "EXECUTE", color: "#3fe0a6" },
  { n: "06", name: "Orchestrator", desc: "Synthesizes everything into one answer", role: "SYNTH", color: "#6e8bff" },
];

export function LabsSection() {
  return (
    <div className="nx-stage nx-container">
      <div className="nx-dhead">
        <div>
          <h1 className="nx-dtitle">Northstar Labs</h1>
          <p className="nx-dsub">
            A local-first, multi-agent lab. Hand the crew a task; watch it plan,
            delegate, and synthesize — live.
          </p>
        </div>
        <Link href="/labs" className="nx-btn nx-btn-aurora">
          Open the live lab <Arrow />
        </Link>
      </div>

      <div className="nx-grid">
        <section className="nx-panel nx-col-7">
          <header className="nx-card-head">
            <span className="nx-eyebrow">THE PIPELINE</span>
            <span className="nx-mono">SEQUENTIAL · SHARED MEMORY</span>
          </header>
          <div className="nx-card-body">
            <ul className="nx-pipeline">
              {PIPELINE.map((p) => (
                <li key={p.n + p.name} className="nx-pipe">
                  <span
                    className="nx-pipe-node"
                    style={{ background: p.color }}
                  >
                    {p.n}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{p.name}</b>
                    <span>{p.desc}</span>
                  </div>
                  <span className="nx-pipe-role">{p.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="nx-panel nx-col-5">
          <header className="nx-card-head">
            <span className="nx-eyebrow">DECISION MESH</span>
            <span className="nx-sync" style={{ color: "var(--green)" }}>
              <span className="nx-live" /> CONSENSUS
            </span>
          </header>
          <div className="nx-card-body">
            <div
              style={{
                aspectRatio: "1 / 1",
                background:
                  "radial-gradient(120% 120% at 70% 20%, #0b0e16, #070809)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                overflow: "hidden",
                padding: "6%",
              }}
            >
              <StudyAgentMesh />
            </div>
            <p
              style={{
                color: "var(--text-2)",
                fontSize: 13.5,
                marginTop: 16,
              }}
            >
              Every step is written to shared memory, so agents build on each
              other within a run and runs compound across a session.
            </p>
          </div>
        </section>

        <section className="nx-panel nx-col-12">
          <div className="nx-card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {[
                ["Streaming runs", "Agents light up live via SSE as each one works."],
                ["Sessions", "Multiple named labs, each with isolated, persisted memory."],
                ["Memory Explorer", "Search and filter the shared memory by kind, author, text."],
                ["Run metrics", "Per-agent latency, token usage, and estimated cost."],
              ].map(([t, d]) => (
                <div key={t}>
                  <h3 className="nx-h3" style={{ fontSize: 15 }}>{t}</h3>
                  <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
