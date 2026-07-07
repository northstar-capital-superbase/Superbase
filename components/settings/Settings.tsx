"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { OsNav } from "@/components/os/OsNav";
import { Alert } from "@/components/ui";
import {
  AccentPicker,
  KeyValue,
  NumberField,
  Row,
  Segmented,
  SettingsSection,
  StatusBadge,
  Toggle,
  type StatusState,
} from "./controls";
import { IntegrationsSettings, MemorySettings } from "./live";
import { useSettings } from "./useSettings";
import "@/components/dashboard/labs.css";
import "./settings.css";

const APP_VERSION = "0.3.0";

type SectionId = "ai" | "memory" | "trading" | "integrations" | "appearance" | "system";

const NAV: { id: SectionId; label: string }[] = [
  { id: "ai", label: "AI Configuration" },
  { id: "memory", label: "Memory" },
  { id: "trading", label: "Trading Controls" },
  { id: "integrations", label: "Integrations" },
  { id: "appearance", label: "Appearance" },
  { id: "system", label: "System" },
];

const GearGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);
const TradeGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l5-5 4 4 8-8M21 8v5M21 8h-5" />
  </svg>
);
const PaintGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="8.5" cy="10" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="10" r="1.2" fill="currentColor" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" />
  </svg>
);
const ChipGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);

function SystemSettings() {
  const [api, setApi] = useState<StatusState>("checking");
  const [mem, setMem] = useState<string>("…");
  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/health");
        const d = await r.json();
        setApi(d.ok ? "ok" : "warn");
        setMem(d.memory === "supabase" ? "Supabase" : "Local");
      } catch {
        setApi("warn");
        setMem("unknown");
      }
    })();
  }, []);
  const env =
    typeof process !== "undefined" && process.env.NODE_ENV
      ? process.env.NODE_ENV
      : "production";
  const build =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BUILD) || "local";
  return (
    <SettingsSection
      id="system"
      title="System Information"
      description="Build and runtime details for this deployment."
      icon={ChipGlyph}
    >
      <KeyValue
        items={[
          { label: "Version", value: `v${APP_VERSION}` },
          { label: "Environment", value: <span style={{ textTransform: "capitalize" }}>{env}</span> },
          { label: "Build number", value: build },
          { label: "API status", value: <StatusBadge state={api} label={api === "ok" ? "Operational" : api === "checking" ? "Checking" : "Degraded"} /> },
          { label: "Memory status", value: mem },
        ]}
      />
    </SettingsSection>
  );
}

export function Settings() {
  const { settings, update } = useSettings();
  const [active, setActive] = useState<SectionId>("ai");
  const live = settings.trading.mode === "live";

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
            <p className="lx-sub">Configure models, memory, trading, and the look of your OS.</p>
          </div>
        </div>

        <div className="lx-set-layout">
          <nav className="lx-set-nav" aria-label="Settings sections">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                className={clsx("lx-set-nav-link", active === n.id && "active")}
                aria-current={active === n.id ? "page" : undefined}
                onClick={() => setActive(n.id)}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="lx-set-content" key={active}>
            {/* AI Configuration */}
            {active === "ai" && (
            <SettingsSection
              id="ai"
              title="AI Configuration"
              description="Choose the model, how hard it thinks, and how many agents collaborate."
              icon={GearGlyph}
            >
              {/* NEEDS_OWNER_INPUT: this model preference is stored locally
                  (localStorage) and is not wired to the backend — the runtime
                  provider/model is selected server-side from ANTHROPIC_API_KEY /
                  OPENAI_API_KEY / LLM_PROVIDER env vars. Wire this control to the
                  crew API if you want it to switch live models. */}
              <Row
                title="Primary model"
                description="The model that leads every run. Stored locally — the live provider is chosen by server env keys."
                stack
              >
                <Segmented
                  ariaLabel="Primary model"
                  value={settings.ai.model}
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
                  value={settings.ai.reasoning}
                  onChange={(reasoning) => update("ai", { reasoning })}
                  options={[
                    { value: "fast", label: "Fast", hint: "lowest latency" },
                    { value: "balanced", label: "Balanced" },
                    { value: "deep", label: "Deep", hint: "max quality" },
                  ]}
                />
              </Row>
              <Row title="Agent mode" description="Run a single agent or the full collaborating crew." stack>
                <Segmented
                  ariaLabel="Agent mode"
                  value={settings.ai.agentMode}
                  onChange={(agentMode) => update("ai", { agentMode })}
                  options={[
                    { value: "single", label: "Single Agent" },
                    { value: "multi", label: "Multi-Agent", hint: "orchestrated" },
                  ]}
                />
              </Row>
            </SettingsSection>
            )}

            {/* Memory (live) */}
            {active === "memory" && <MemorySettings />}

            {/* Trading Controls */}
            {/* NEEDS_OWNER_INPUT: these guardrail preferences persist locally;
                the enforced trading policy (mode, per-order cap) comes from
                TRADING_MODE / TRADING_MAX_ORDER_USD server env vars — see
                docs/TRADING.md to change the live limits. */}
            {active === "trading" && (
            <SettingsSection
              id="trading"
              title="Trading Controls"
              description="Guardrails for the Robinhood Agentic trader."
              icon={TradeGlyph}
            >
              {live && (
                <Alert tone="warning" role="alert" className="lx-set-alert">
                  <strong>Live trading is enabled.</strong> Orders use real funds within the
                  limits below. Confirm your caps before continuing.
                </Alert>
              )}
              <Row title="Trading mode" description="Disabled, simulated paper, or live capital." stack>
                <Segmented
                  ariaLabel="Trading mode"
                  value={settings.trading.mode}
                  onChange={(mode) => update("trading", { mode })}
                  options={[
                    { value: "disabled", label: "Disabled" },
                    { value: "paper", label: "Paper", hint: "simulated" },
                    { value: "live", label: "Live", hint: "real funds" },
                  ]}
                />
              </Row>
              <Row title="Daily loss limit" description="Halt trading once losses hit this for the day.">
                <NumberField
                  prefix="$"
                  min={0}
                  step={50}
                  value={settings.trading.dailyLossLimit}
                  onChange={(dailyLossLimit) => update("trading", { dailyLossLimit })}
                />
              </Row>
              <Row title="Max position size" description="Largest notional the agent may hold in one position.">
                <NumberField
                  prefix="$"
                  min={0}
                  step={100}
                  value={settings.trading.maxPositionSize}
                  onChange={(maxPositionSize) => update("trading", { maxPositionSize })}
                />
              </Row>
              <Row title="Auto execution" description="Let the agent place orders without manual approval.">
                <Toggle
                  label="Auto execution"
                  checked={settings.trading.autoExecution}
                  onChange={(autoExecution) => update("trading", { autoExecution })}
                />
              </Row>
            </SettingsSection>
            )}

            {/* Integrations (live) */}
            {active === "integrations" && <IntegrationsSettings />}

            {/* Appearance */}
            {active === "appearance" && (
            <SettingsSection
              id="appearance"
              title="Appearance"
              description="Theme and accent for the Northstar interface."
              icon={PaintGlyph}
            >
              <Row title="Theme" description="Dark is the native Northstar look." stack>
                <Segmented
                  ariaLabel="Theme"
                  value={settings.appearance.theme}
                  onChange={(theme) => update("appearance", { theme })}
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" },
                  ]}
                />
              </Row>
              <Row title="Accent color" description="Applied across glows, controls, and highlights.">
                <AccentPicker
                  value={settings.appearance.accent}
                  onChange={(accent) => update("appearance", { accent })}
                />
              </Row>
            </SettingsSection>
            )}

            {/* System */}
            {active === "system" && <SystemSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}
