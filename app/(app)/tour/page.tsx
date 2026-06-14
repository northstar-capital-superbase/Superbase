import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs — Northstar OS",
  description: "A guided overview of the multi-agent lab interface.",
};

const AGENTS = [
  { name: "Orchestrator", role: "plans & synthesizes", color: "#6d8bff" },
  { name: "Research", role: "facts & context", color: "#34d399" },
  { name: "Strategist", role: "sequences a plan", color: "#a78bfa" },
  { name: "Behavioral", role: "risks & human factors", color: "#fbbf24" },
];

const FEATURES = [
  ["Sidebar", "Brand, the 5-step pipeline legend, and a live runtime panel (provider · model · memory backend)."],
  ["Integrations cockpit", "Status tiles for LLM, memory, and GitHub with a one-click 'Run diagnostics' connectivity test."],
  ["Agent roster", "One card per agent — they light up in real time as each one works during a run."],
  ["Lab Console", "The task input and conversation; each answer is the orchestrator's synthesis with an expandable trace."],
  ["Agent trace + metrics", "Under each answer: the plan, every specialist's output, and metrics (latency · tokens · est. cost)."],
  ["Shared Memory", "Live tail of what agents read/write, with full-text Explore and Markdown Export."],
  ["Labs (sessions)", "Create/switch/delete labs from the header — each keeps isolated, persisted memory and transcript."],
];

const FLOW = [
  "Type a task in the Lab Console and hit Run.",
  "The Orchestrator card lights up — it drafts a delegation plan.",
  "Research → Strategist → Behavioral run in sequence; the memory tail fills in live as each writes.",
  "The Orchestrator lights up again to synthesize everything.",
  "The final answer appears; expand the trace to see each agent's work and the run metrics.",
];

export default function TourPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-12">
      {/* Hero */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent shadow-glow-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Northstar Labs — UI Tour</h1>
          <p className="text-[13px] text-slate-500">
            A guided overview of the multi-agent operating system.
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-base-800/70 px-3 py-1 text-[11px] text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-signal-behavioral" />
        Running in mock mode — every screen works with no API keys; agents return
        canned responses so you can review the flow.
      </div>

      {/* Layout mock */}
      <section className="mt-8">
        <SectionTitle>The layout</SectionTitle>
        <div className="panel mt-3 flex gap-2 p-3 text-[10px]">
          <div className="flex w-28 shrink-0 flex-col gap-2 rounded-lg border border-white/5 bg-base-850/60 p-2 text-slate-500">
            <span className="font-semibold text-slate-300">Sidebar</span>
            <span>pipeline</span>
            <span>runtime</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-base-750/50 p-2">
              <span className="text-slate-300">Agent Operating System</span>
              <span className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400">Lab ▾</span>
            </div>
            <div className="rounded-lg border border-white/5 bg-base-750/50 p-2 text-slate-400">
              Integrations cockpit · diagnostics
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AGENTS.map((a) => (
                <div key={a.name} className="rounded-lg border-t-2 bg-base-750/50 p-2" style={{ borderColor: a.color }}>
                  <span style={{ color: a.color }}>{a.name}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <div className="rounded-lg border border-white/5 bg-base-750/50 p-2 text-slate-400">
                Lab Console — chat + streamed agent trace
              </div>
              <div className="rounded-lg border border-white/5 bg-base-750/50 p-2 text-slate-400">
                Shared Memory
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="mt-8">
        <SectionTitle>The agents</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AGENTS.map((a) => (
            <div key={a.name} className="panel-tight p-3">
              <div className="h-1 w-8 rounded-full" style={{ backgroundColor: a.color }} />
              <div className="mt-2 text-sm font-semibold text-white">{a.name}</div>
              <div className="text-[11px] text-slate-500">{a.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-8">
        <SectionTitle>On screen</SectionTitle>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="panel-tight p-3">
              <div className="text-[13px] font-semibold text-white">{title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section className="mt-8">
        <SectionTitle>How a run looks</SectionTitle>
        <ol className="mt-3 space-y-2">
          {FLOW.map((step, i) => (
            <li key={i} className="flex gap-3 panel-tight p-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">
                {i + 1}
              </span>
              <span className="text-[12px] leading-relaxed text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
        <p className="text-[12px] text-slate-500">Ready to try it?</p>
        <Link
          href="/labs"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-base-900 transition hover:bg-accent-soft"
        >
          Open the live lab →
        </Link>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </h2>
  );
}
