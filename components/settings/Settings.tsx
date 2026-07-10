"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { OsNav } from "@/components/os/OsNav";
import { Alert, OwnerNote } from "@/components/ui";
import {
  KeyValue,
  NumberField,
  Row,
  Segmented,
  SelectRow,
  SettingsSection,
  StatusBadge,
  Toggle,
  type StatusState,
} from "./controls";
import { AppearancePanel } from "./AppearancePanel";
import { IntegrationsSettings, MemorySettings } from "./live";
import { useSettings } from "./useSettings";
import type { AgentProfile } from "@/components/shared";
import "@/components/dashboard/labs.css";
import "./settings.css";

const APP_VERSION = "0.4.0";

type SectionId =
  | "general"
  | "appearance"
  | "ai"
  | "agents"
  | "memory"
  | "performance"
  | "notifications"
  | "privacy"
  | "developer"
  | "connections"
  | "experimental"
  | "auth";

const NAV_GROUPS: { group: string; items: { id: SectionId; label: string }[] }[] = [
  {
    group: "Workspace",
    items: [
      { id: "general", label: "General" },
      { id: "appearance", label: "Appearance" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { id: "ai", label: "AI Models" },
      { id: "agents", label: "Agents" },
      { id: "memory", label: "Memory" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "performance", label: "Performance" },
      { id: "notifications", label: "Notifications" },
      { id: "privacy", label: "Privacy" },
      { id: "developer", label: "Developer Mode" },
    ],
  },
  {
    group: "Platform",
    items: [
      { id: "connections", label: "Connections" },
      { id: "experimental", label: "Experimental" },
      { id: "auth", label: "Authentication" },
    ],
  },
];
const ALL_IDS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));

const glyph = (path: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const G = {
  general: glyph("M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z"),
  ai: glyph("M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.7 1-5.5-4-3.9 5.5-.8z"),
  agents: glyph("M9 7a3 3 0 116 0 3 3 0 01-6 0zM4 20a5 5 0 0116 0"),
  perf: glyph("M13 2L4.5 13.5H11l-1 8L19.5 10H13z"),
  notif: glyph("M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"),
  privacy: glyph("M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"),
  dev: glyph("M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14"),
  conn: glyph("M9 7V3M15 7V3M7 7h10v4a5 5 0 01-10 0V7zM12 16v5"),
  exp: glyph("M9 3h6M10 3v6l-4.5 8a2 2 0 001.8 3h9.4a2 2 0 001.8-3L14 9V3"),
  auth: glyph("M12 15a2 2 0 100-4 2 2 0 000 4zM6 10V8a6 6 0 1112 0v2M5 10h14v10H5z"),
};

// ── General ──────────────────────────────────────────────────────────────────
function GeneralSettings() {
  const { settings, update } = useSettings();
  const g = settings.general;
  return (
    <SettingsSection id="general" title="General" description="Defaults for how Northstar opens and behaves." icon={G.general}>
      <Row title="Launch view" description="Where Northstar opens after you enter the OS." stack>
        <Segmented
          ariaLabel="Launch view"
          value={g.launchView}
          onChange={(launchView) => update("general", { launchView })}
          options={[
            { value: "command", label: "Command Center" },
            { value: "console", label: "Lab Console" },
          ]}
        />
      </Row>
      <Row title="Send on Enter" description="Enter sends; Shift+Enter makes a new line.">
        <Toggle label="Send on Enter" checked={g.sendOnEnter} onChange={(sendOnEnter) => update("general", { sendOnEnter })} />
      </Row>
      <Row title="Show tips" description="Surface sample prompts and first-run hints in an empty console.">
        <Toggle label="Show tips" checked={g.showTips} onChange={(showTips) => update("general", { showTips })} />
      </Row>
    </SettingsSection>
  );
}

// ── AI Models ────────────────────────────────────────────────────────────────
function AiSettings() {
  const { settings, update } = useSettings();
  const ai = settings.ai;
  return (
    <SettingsSection id="ai" title="AI Models" description="Model, reasoning depth, and how many agents collaborate." icon={G.ai}>
      {/* NEEDS_OWNER_INPUT: model preference is local; the live provider is
          selected server-side from ANTHROPIC_API_KEY / OPENAI_API_KEY / LLM_PROVIDER. */}
      <OwnerNote>
        Model choice is a local preference. The live provider is chosen server-side from your
        API keys — see the Connections tab to verify what is active.
      </OwnerNote>
      <Row title="Primary model" description="Preferred model that leads every run." stack>
        <Segmented
          ariaLabel="Primary model"
          value={ai.model}
          onChange={(model) => update("ai", { model })}
          options={[
            { value: "gpt-5.5", label: "GPT-5.5" },
            { value: "claude", label: "Claude" },
            { value: "gemini", label: "Gemini" },
            { value: "auto", label: "Auto", hint: "best per task" },
          ]}
        />
      </Row>
      <Row title="Reasoning" description="Trade latency for depth of thought." stack>
        <Segmented
          ariaLabel="Reasoning"
          value={ai.reasoning}
          onChange={(reasoning) => update("ai", { reasoning })}
          options={[
            { value: "fast", label: "Fast", hint: "lowest latency" },
            { value: "balanced", label: "Balanced" },
            { value: "deep", label: "Deep", hint: "max quality" },
          ]}
        />
      </Row>
      <Row title="Agent mode" description="A single agent or the full collaborating crew." stack>
        <Segmented
          ariaLabel="Agent mode"
          value={ai.agentMode}
          onChange={(agentMode) => update("ai", { agentMode })}
          options={[
            { value: "single", label: "Single Agent" },
            { value: "multi", label: "Multi-Agent", hint: "orchestrated" },
          ]}
        />
      </Row>
    </SettingsSection>
  );
}

// ── Agents (crew + trading guardrails) ───────────────────────────────────────
function AgentsSettings() {
  const { settings, update } = useSettings();
  const a = settings.agents;
  const t = settings.trading;
  const live = t.mode === "live";

  // Real roster — the same agents that answer in the Lab Console.
  const [roster, setRoster] = useState<AgentProfile[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setRoster(d.agents ?? []);
      })
      .catch(() => {
        if (!cancelled) setRoster([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SettingsSection id="agents" title="Agents" description="The live crew, how it works, and what you see while it runs." icon={G.agents}>
        <div className="lx-agents-roster" aria-busy={roster === null}>
          {roster === null && <div className="lx-agents-roster-loading">Waking the roster…</div>}
          {roster?.map((ag) => (
            <div key={ag.id} className="lx-agents-roster-row">
              <span
                className="lx-agents-roster-badge"
                aria-hidden="true"
                style={{
                  color: ag.color,
                  borderColor: `color-mix(in srgb, ${ag.color} 40%, transparent)`,
                  background: `color-mix(in srgb, ${ag.color} 12%, transparent)`,
                }}
              >
                {ag.name.charAt(0)}
              </span>
              <span className="lx-agents-roster-main">
                <span className="lx-agents-roster-name">{ag.name}</span>
                <span className="lx-agents-roster-role">{ag.role}</span>
              </span>
            </div>
          ))}
        </div>
        <Row title="Show agent trace" description="Reveal each specialist's contribution under the answer.">
          <Toggle label="Show agent trace" checked={a.showTrace} onChange={(showTrace) => update("agents", { showTrace })} />
        </Row>
        <Row title="Auto-open trace" description="Expand the trace automatically when a run finishes.">
          <Toggle label="Auto-open trace" checked={a.autoOpenTrace} onChange={(autoOpenTrace) => update("agents", { autoOpenTrace })} />
        </Row>
      </SettingsSection>

      <SettingsSection id="agents-trading" title="Trading guardrails" description="Limits for the Robinhood Agentic trader." icon={G.agents}>
        {/* NEEDS_OWNER_INPUT: enforced policy comes from TRADING_MODE /
            TRADING_MAX_ORDER_USD server env — these are local preferences. */}
        {live && (
          <Alert tone="warning" role="alert" className="lx-set-alert">
            <strong>Live trading is enabled.</strong> The enforced policy is set server-side; confirm
            your caps before continuing.
          </Alert>
        )}
        <Row title="Trading mode" description="Disabled, simulated paper, or live capital." stack>
          <Segmented
            ariaLabel="Trading mode"
            value={t.mode}
            onChange={(mode) => update("trading", { mode })}
            options={[
              { value: "disabled", label: "Disabled" },
              { value: "paper", label: "Paper", hint: "simulated" },
              { value: "live", label: "Live", hint: "real funds" },
            ]}
          />
        </Row>
        <Row title="Daily loss limit" description="Preferred halt threshold for the day.">
          <NumberField prefix="$" min={0} step={50} value={t.dailyLossLimit} onChange={(dailyLossLimit) => update("trading", { dailyLossLimit })} />
        </Row>
        <Row title="Max position size" description="Largest notional in one position.">
          <NumberField prefix="$" min={0} step={100} value={t.maxPositionSize} onChange={(maxPositionSize) => update("trading", { maxPositionSize })} />
        </Row>
        <Row title="Auto execution" description="Let the agent place orders without manual approval.">
          <Toggle label="Auto execution" checked={t.autoExecution} onChange={(autoExecution) => update("trading", { autoExecution })} />
        </Row>
      </SettingsSection>
    </>
  );
}

// ── Performance ──────────────────────────────────────────────────────────────
function PerformanceSettings() {
  const { settings, update } = useSettings();
  const p = settings.performance;
  return (
    <SettingsSection id="performance" title="Performance" description="Tune responsiveness for your device." icon={G.perf}>
      <Row title="Stream responses" description="Show agents lighting up live via SSE. Off waits for the final answer.">
        <Toggle label="Stream responses" checked={p.streaming} onChange={(streaming) => update("performance", { streaming })} />
      </Row>
      <Row title="Prefetch routes" description="Warm up navigation targets in the background.">
        <Toggle label="Prefetch routes" checked={p.prefetch} onChange={(prefetch) => update("performance", { prefetch })} />
      </Row>
      <Row title="Reduce glass" description="Disable backdrop blur to save GPU on lower-end hardware. Mirrors Appearance → Glass.">
        <Toggle label="Reduce glass" checked={p.reduceGlass} onChange={(reduceGlass) => update("performance", { reduceGlass })} />
      </Row>
    </SettingsSection>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────
function NotificationsSettings() {
  const { settings, update } = useSettings();
  const n = settings.notifications;
  return (
    <SettingsSection id="notifications" title="Notifications" description="What Northstar tells you about a run." icon={G.notif}>
      <Row title="Run complete" description="Highlight the console when a crew run finishes.">
        <Toggle label="Run complete" checked={n.runComplete} onChange={(runComplete) => update("notifications", { runComplete })} />
      </Row>
      <Row title="Sound" description="Play a soft chime on completion.">
        <Toggle label="Sound" checked={n.sound} onChange={(sound) => update("notifications", { sound })} />
      </Row>
      <Row title="Errors" description="Surface failed runs and connection issues.">
        <Toggle label="Errors" checked={n.errors} onChange={(errors) => update("notifications", { errors })} />
      </Row>
    </SettingsSection>
  );
}

// ── Privacy ──────────────────────────────────────────────────────────────────
function PrivacySettings() {
  const { settings, update } = useSettings();
  const pr = settings.privacy;
  return (
    <SettingsSection id="privacy" title="Privacy" description="Northstar is local-first. You control what persists." icon={G.privacy}>
      <OwnerNote>
        Chat history is stored in your browser. Shared memory persists to Supabase only if
        configured, otherwise it lives in-process and clears on restart.
      </OwnerNote>
      <Row title="Persist chat history" description="Keep past conversations in this browser between sessions.">
        <Toggle label="Persist chat history" checked={pr.persistHistory} onChange={(persistHistory) => update("privacy", { persistHistory })} />
      </Row>
      <Row title="Anonymous telemetry" description="Off by default. Northstar collects nothing unless you opt in.">
        <Toggle label="Anonymous telemetry" checked={pr.telemetry} onChange={(telemetry) => update("privacy", { telemetry })} />
      </Row>
    </SettingsSection>
  );
}

// ── Developer Mode ───────────────────────────────────────────────────────────
function DeveloperSettings() {
  const { settings, update } = useSettings();
  const d = settings.developer;
  const [api, setApi] = useState<StatusState>("checking");
  const [mem, setMem] = useState<string>("…");
  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/health");
        const data = await r.json();
        setApi(data.ok ? "ok" : "warn");
        setMem(data.memory === "supabase" ? "Supabase" : "Local");
      } catch {
        setApi("warn");
        setMem("unknown");
      }
    })();
  }, []);
  const env = (typeof process !== "undefined" && process.env.NODE_ENV) || "production";
  const build = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BUILD) || "local";
  return (
    <>
      <SettingsSection id="developer" title="Developer Mode" description="Diagnostics and low-level surfaces." icon={G.dev}>
        <Row title="Developer mode" description="Unlock verbose panels and raw payloads.">
          <Toggle label="Developer mode" checked={d.devMode} onChange={(devMode) => update("developer", { devMode })} />
        </Row>
        <Row title="Show token usage" description="Display per-agent tokens and estimated cost in the trace.">
          <Toggle label="Show token usage" checked={d.showTokens} onChange={(showTokens) => update("developer", { showTokens })} />
        </Row>
        <Row title="Verbose logging" description="Log stream events and agent transitions to the console.">
          <Toggle label="Verbose logging" checked={d.verboseLogging} onChange={(verboseLogging) => update("developer", { verboseLogging })} />
        </Row>
      </SettingsSection>
      <SettingsSection id="system" title="System information" description="Build and runtime details for this deployment." icon={G.dev}>
        <KeyValue
          items={[
            { label: "Version", value: `v${APP_VERSION}` },
            { label: "Environment", value: <span style={{ textTransform: "capitalize" }}>{env}</span> },
            { label: "Build", value: build },
            { label: "API status", value: <StatusBadge state={api} label={api === "ok" ? "Operational" : api === "checking" ? "Checking" : "Degraded"} /> },
            { label: "Memory backend", value: mem },
          ]}
        />
      </SettingsSection>
    </>
  );
}

// ── Experimental ─────────────────────────────────────────────────────────────
function ExperimentalSettings() {
  const { settings, update } = useSettings();
  const e = settings.experimental;
  return (
    <SettingsSection id="experimental" title="Experimental Features" description="Previews under active development. Expect rough edges." icon={G.exp}>
      <OwnerNote>These flags are local previews and may change or be removed.</OwnerNote>
      <Row title="Voice input" description="Dictate prompts with the microphone in the composer.">
        <Toggle label="Voice input" checked={e.voiceInput} onChange={(voiceInput) => update("experimental", { voiceInput })} />
      </Row>
      <Row title="Multiple labs" description="Run several isolated labs with separate memory.">
        <Toggle label="Multiple labs" checked={e.multiLab} onChange={(multiLab) => update("experimental", { multiLab })} />
      </Row>
      <Row title="Inline memory" description="Show shared-memory context inline in the thread.">
        <Toggle label="Inline memory" checked={e.inlineMemory} onChange={(inlineMemory) => update("experimental", { inlineMemory })} />
      </Row>
    </SettingsSection>
  );
}

// ── Authentication ───────────────────────────────────────────────────────────
function AuthSettings() {
  return (
    <SettingsSection id="auth" title="Authentication" description="Account and access for this Northstar instance." icon={G.auth}>
      <OwnerNote>
        Northstar runs local-first with no sign-in required. Connect an auth provider in your
        deployment to enable accounts and per-user memory.
      </OwnerNote>
      <KeyValue
        items={[
          { label: "Mode", value: "Local-first (no account)" },
          { label: "Provider", value: <StatusBadge state="off" label="Not configured" /> },
          { label: "Session", value: "This device" },
        ]}
      />
    </SettingsSection>
  );
}

export function Settings() {
  const [active, setActive] = useState<SectionId>("general");

  // URL-addressable sections (?section=appearance) without a full navigation.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("section");
    if (s && (ALL_IDS as string[]).includes(s)) setActive(s as SectionId);
  }, []);
  const go = (id: SectionId) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("section", id);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      <header className="lx-topbar">
        <div className="lx-topbar-inner">
          <div className="lx-topbar-left">
            <OsNav active="settings" />
          </div>
          <Link href="/" className="lx-tour">
            ← Home
          </Link>
        </div>
      </header>

      <main className="lx-main">
        <div className="lx-head">
          <div>
            <h1 className="lx-title">Settings</h1>
            <p className="lx-sub">Your control center — models, agents, memory, appearance, and the platform.</p>
          </div>
        </div>

        <div className="lx-set-layout">
          <nav className="lx-set-nav" aria-label="Settings sections">
            {NAV_GROUPS.map((grp) => (
              <div key={grp.group} className="lx-set-nav-group">
                <div className="lx-set-nav-heading">{grp.group}</div>
                {grp.items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={clsx("lx-set-nav-link", active === n.id && "active")}
                    aria-current={active === n.id ? "page" : undefined}
                    onClick={() => go(n.id)}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="lx-set-content" key={active}>
            {active === "general" && <GeneralSettings />}
            {active === "appearance" && <AppearancePanel />}
            {active === "ai" && <AiSettings />}
            {active === "agents" && <AgentsSettings />}
            {active === "memory" && <MemorySettings />}
            {active === "performance" && <PerformanceSettings />}
            {active === "notifications" && <NotificationsSettings />}
            {active === "privacy" && <PrivacySettings />}
            {active === "developer" && <DeveloperSettings />}
            {active === "connections" && <IntegrationsSettings />}
            {active === "experimental" && <ExperimentalSettings />}
            {active === "auth" && <AuthSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}
