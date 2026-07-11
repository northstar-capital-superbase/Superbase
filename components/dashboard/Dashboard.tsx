"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DailyBriefing } from "./DailyBriefing";
import { Recommendations } from "./Recommendations";
import { RecentActivity } from "./RecentActivity";
import { PortfolioSnapshot } from "./PortfolioSnapshot";
import { PendingItems } from "./PendingItems";
import { CrewStatus, type CrewLoadState } from "./CrewStatus";
import { Skeleton } from "@/components/ui";
import { useSettings } from "@/components/settings/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { useRuntimeStatus } from "@/components/useRuntimeStatus";
import { useChatHistory } from "@/components/labs/useChatHistory";
import { greetingText } from "@/lib/auth/greeting";
import { buildPendingItems, type CommandCenterSignals } from "@/lib/dashboard/briefing";
import { pipelineAgentIds, type AgentProfile } from "@/components/shared";
import "./labs.css";

const HINT_KEY = "northstar.hint.commandcenter.dismissed";

// Command Center — the home of the AI operating system. It answers, in order:
// what's my situation (greeting + briefing), what's recommended, what changed
// (activity), what's my portfolio, what needs me (pending), who's on the crew,
// and what should I do next (continue). Every section renders only real, empty,
// or unavailable state — never fabricated data. Runtime/trading status is read
// from the shared RuntimeStatusProvider (mounted in OsShell) so this page adds
// no duplicate /api/health or /api/trading requests; the one extra fetch here
// is /api/agents for the crew roster.
export function Dashboard() {
  const { user, profile } = useAuth();
  const runtime = useRuntimeStatus();
  const { history } = useChatHistory(user?.id);

  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [crewState, setCrewState] = useState<CrewLoadState>("loading");

  const loadAgents = useCallback(() => {
    setCrewState("loading");
    fetch("/api/agents")
      .then((r) => {
        if (!r.ok) throw new Error(`agents ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setAgents((d.agents as AgentProfile[]) ?? []);
        setCrewState("ready");
      })
      .catch(() => {
        setAgents([]);
        setCrewState("error");
      });
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const signals: CommandCenterSignals = {
    configured: runtime.configured,
    memory: runtime.memory,
    tradingEnabled: runtime.tradingEnabled,
    hasDisplayName: Boolean(profile?.displayName?.trim()),
    hasSessions: history.length > 0,
  };
  const pending = buildPendingItems(signals);
  const activeAgents = useMemo(() => {
    const activeIds = new Set(pipelineAgentIds(runtime.tradingEnabled));
    return agents.filter((agent) => activeIds.has(agent.id));
  }, [agents, runtime.tradingEnabled]);

  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      <header className="lx-topbar">
        <div className="lx-topbar-inner lx-topbar-inner--slim">
          <RuntimePills />
        </div>
      </header>

      <main className="lx-main cc">
        <div className="cc-head">
          <DateEyebrow />
          <h1 className="cc-greeting">{greetingText(profile?.displayName, user?.email)}</h1>
        </div>

        <FirstRunHint />

        <div className="cc-reveal">
          <DailyBriefing signals={signals} loading={!runtime.loaded} />

          {/* No recommendations engine exists yet — [] renders the honest
              empty state. A future engine plugs in here without a redesign
              (see lib/dashboard/recommendations.ts). */}
          <Recommendations recommendations={[]} />

          <RecentActivity history={history} />

          <div className="cc-grid">
            <PortfolioSnapshot loading={!runtime.loaded} connected={runtime.tradingEnabled} />
            <PendingItems items={pending} loading={!runtime.loaded} />
          </div>

          <CrewStatus
            state={crewState}
            agents={activeAgents}
            runtimeLoaded={runtime.loaded}
            configured={runtime.configured}
            onRetry={loadAgents}
          />
        </div>

        {/* Continue working — the home funnels naturally into the Lab Console. */}
        <Link href="/labs/console" className="lx-console-cta cc-continue">
          <span className="lx-console-cta-icon" aria-hidden="true">
            <ChatGlyph />
          </span>
          <span className="lx-console-cta-main">
            <span className="lx-console-cta-title">Open Lab Console</span>
            <span className="lx-console-cta-sub">
              Hand the crew a task — the orchestrator plans, specialists collaborate
              through shared memory, then it synthesizes one answer.
            </span>
          </span>
          <span className="lx-console-cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </main>
    </div>
  );
}

// The date line above the greeting — computed after mount to avoid any
// server/client timezone hydration mismatch.
function DateEyebrow() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);
  return (
    <p className="lx-eyebrow cc-date" aria-hidden={label ? undefined : true}>
      {label || "\u00a0"}
    </p>
  );
}

// Lightweight, dismissible first-run pointer to the Lab Console. Honors
// Settings → General → "Show tips" and remembers dismissal locally.
function FirstRunHint() {
  const { settings, ready } = useSettings();
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(HINT_KEY) === "1");
  }, []);
  if (!ready || dismissed || !settings.general.showTips) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* storage may be unavailable */
    }
  };
  return (
    <div className="lx-hint" role="note">
      <span className="lx-hint-mark" aria-hidden="true">
        <ChatGlyph />
      </span>
      <div className="lx-hint-main">
        <span className="lx-hint-title">Welcome to Northstar OS</span>
        <span className="lx-hint-sub">
          Hand the crew a task in the Lab Console — the orchestrator plans, specialists
          collaborate through shared memory, then it synthesizes one answer.
        </span>
      </div>
      <Link href="/labs/console" className="lx-hint-cta">
        Open Console →
      </Link>
      <button type="button" className="lx-hint-x" onClick={dismiss} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

// Runtime status pills in the slim topbar. Sourced from the shared runtime
// probe (no extra fetch): language model, shared memory, trader.
function RuntimePills() {
  const { loaded, reachable, provider, model, configured, memory, tradingEnabled } =
    useRuntimeStatus();
  // Waking up: show quiet placeholders instead of misleading "off" states.
  if (!loaded) {
    return (
      <div className="lx-pills" aria-label="Checking runtime status">
        <Skeleton width={92} height={27} style={{ borderRadius: 999 }} />
        <Skeleton width={98} height={27} style={{ borderRadius: 999 }} className="opt" />
        <Skeleton width={88} height={27} style={{ borderRadius: 999 }} className="opt" />
      </div>
    );
  }
  if (!reachable) {
    return (
      <div className="lx-pills" aria-label="Runtime unavailable">
        <span className="lx-pill">
          <span className="lx-dot off" aria-hidden="true" />
          <b>Runtime unavailable</b>
        </span>
      </div>
    );
  }
  const memLive = memory === "supabase";
  return (
    <div
      className="lx-pills"
      aria-label={`Language model ${provider ?? "not configured"}, memory ${
        memLive ? "Supabase" : "in-memory"
      }, trader ${tradingEnabled ? "available" : "off"}`}
    >
      <span className="lx-pill" title={model ?? "model"}>
        <span className={`lx-dot ${configured ? "on" : "off"}`} />
        <b>{provider ?? "no model"}</b>
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${memLive ? "on" : "off"}`} />
        {memLive ? "Supabase" : "In-memory"}
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${tradingEnabled ? "on" : "off"}`} />
        Trader {tradingEnabled ? "live" : "off"}
      </span>
    </div>
  );
}

function ChatGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
