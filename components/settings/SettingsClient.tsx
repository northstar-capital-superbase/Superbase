"use client";

import { useState } from "react";
import clsx from "clsx";

type Tab = "system" | "agents" | "trading" | "appearance";

export function SettingsClient() {
  const [tab, setTab] = useState<Tab>("system");

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="label-mono mb-1.5 md:mb-2">Configuration</div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
          Settings
        </h1>
        <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
          Configure your Northstar OS environment, agents, and integrations.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex overflow-x-auto border-b border-white/[0.04]">
        {(
          [
            ["system", "System"],
            ["agents", "Agents"],
            ["trading", "Trading"],
            ["appearance", "Appearance"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex-shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
              tab === id
                ? "border-accent text-accent"
                : "border-transparent text-slate-500 hover:text-slate-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* System tab */}
      {tab === "system" && (
        <div className="space-y-4">
          <SettingsGroup title="LLM Provider">
            <SettingRow
              label="Provider"
              description="The AI model provider used for all agent runs."
              control={
                <select className="rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none">
                  <option>Mock (development)</option>
                  <option>Anthropic Claude</option>
                  <option>OpenAI GPT</option>
                </select>
              }
            />
            <SettingRow
              label="Model"
              description="Specific model version for agent inference."
              control={
                <input
                  defaultValue="claude-opus-4-5"
                  placeholder="Model ID"
                  className="rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 placeholder-slate-600 focus:border-accent/40 focus:outline-none"
                />
              }
            />
          </SettingsGroup>

          <SettingsGroup title="Memory Backend">
            <SettingRow
              label="Backend"
              description="Where agent memory is persisted. In-memory resets on restart."
              control={
                <select className="rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none">
                  <option>In-memory (default)</option>
                  <option>Supabase</option>
                </select>
              }
            />
            <SettingRow
              label="Supabase URL"
              description="Required if using Supabase memory backend."
              control={
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  className="w-full max-w-sm rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 placeholder-slate-600 focus:border-accent/40 focus:outline-none"
                />
              }
            />
          </SettingsGroup>

          <SettingsGroup title="API Keys">
            <SettingRow
              label="Anthropic API Key"
              description="Required for live Claude models."
              control={
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  className="w-full max-w-sm rounded-lg border border-white/10 bg-base-800 px-3 py-2 font-mono text-[12px] text-slate-300 placeholder-slate-600 focus:border-accent/40 focus:outline-none"
                />
              }
            />
            <SettingRow
              label="OpenAI API Key"
              description="Optional alternative to Anthropic."
              control={
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full max-w-sm rounded-lg border border-white/10 bg-base-800 px-3 py-2 font-mono text-[12px] text-slate-300 placeholder-slate-600 focus:border-accent/40 focus:outline-none"
                />
              }
            />
          </SettingsGroup>
        </div>
      )}

      {/* Agents tab */}
      {tab === "agents" && (
        <div className="space-y-4">
          <SettingsGroup title="Pipeline Configuration">
            <SettingRow
              label="Enable Research agent"
              description="Gathers facts, data, and context before strategizing."
              control={<Toggle defaultChecked />}
            />
            <SettingRow
              label="Enable Strategist agent"
              description="Converts research into a concrete, sequenced plan."
              control={<Toggle defaultChecked />}
            />
            <SettingRow
              label="Enable Behavioral agent"
              description="Pressure-tests plans for bias, risk, and human factors."
              control={<Toggle defaultChecked />}
            />
            <SettingRow
              label="Enable Trader agent"
              description="Executes orders via Robinhood MCP (requires token)."
              control={<Toggle />}
            />
          </SettingsGroup>

          <SettingsGroup title="Memory">
            <SettingRow
              label="Persist memory across sessions"
              description="Requires Supabase backend. In-memory is always ephemeral."
              control={<Toggle />}
            />
            <SettingRow
              label="Max memory entries per session"
              description="Older entries are evicted when limit is reached."
              control={
                <input
                  type="number"
                  defaultValue={500}
                  className="w-24 rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none"
                />
              }
            />
          </SettingsGroup>
        </div>
      )}

      {/* Trading tab */}
      {tab === "trading" && (
        <div className="space-y-4">
          <SettingsGroup title="Robinhood Agentic">
            <SettingRow
              label="Robinhood MCP token"
              description="OAuth token for the Robinhood Agentic trading API."
              control={
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Not set — OAuth required"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-base-800 px-3 py-2 font-mono text-[12px] text-slate-300 placeholder-slate-600 focus:border-accent/40 focus:outline-none"
                  />
                  <a
                    href="/api/trading/oauth/start"
                    className="btn btn-secondary btn-sm flex-shrink-0"
                  >
                    Connect
                  </a>
                </div>
              }
            />
            <SettingRow
              label="Execution mode"
              description="Controls whether agents can place orders automatically."
              control={
                <select className="rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none">
                  <option>Advisory (read-only)</option>
                  <option>Confirm (approve each order)</option>
                  <option>Auto (within caps)</option>
                </select>
              }
            />
            <SettingRow
              label="Max order size (USD)"
              description="Maximum per-order value. Enforced by the Trader agent."
              control={
                <input
                  type="number"
                  defaultValue={100}
                  className="w-28 rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none"
                />
              }
            />
            <SettingRow
              label="Max orders per crew run"
              description="Hard cap on the number of orders per pipeline execution."
              control={
                <input
                  type="number"
                  defaultValue={3}
                  className="w-24 rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-300 focus:border-accent/40 focus:outline-none"
                />
              }
            />
          </SettingsGroup>

          <div className="rounded-lg border border-status-warning/15 bg-status-warning/5 p-4 text-[12px] text-status-warning/90">
            <strong className="font-semibold">Trading disclaimer:</strong> Northstar OS connects to a Robinhood Agentic account. Real money may be deployed by AI agents within your configured caps. Review all settings carefully.
          </div>
        </div>
      )}

      {/* Appearance tab */}
      {tab === "appearance" && (
        <div className="space-y-4">
          <SettingsGroup title="Theme">
            <SettingRow
              label="Color scheme"
              description="Northstar OS uses a dark theme optimized for financial data density."
              control={
                <select
                  disabled
                  className="cursor-not-allowed rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-[13px] text-slate-500 focus:outline-none"
                >
                  <option>Dark (system default)</option>
                </select>
              }
            />
            <SettingRow
              label="Accent color"
              description="Primary action and highlight color."
              control={
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-accent shadow-glow-accent" />
                  <span className="font-mono text-[12px] text-slate-500">#6d8bff</span>
                </div>
              }
            />
          </SettingsGroup>

          <SettingsGroup title="Data Display">
            <SettingRow
              label="Compact view"
              description="Reduce padding and card sizes for denser information display."
              control={<Toggle />}
            />
            <SettingRow
              label="Show mock mode notice"
              description="Display a banner when running in mock mode."
              control={<Toggle defaultChecked />}
            />
          </SettingsGroup>
        </div>
      )}

      {/* Save button */}
      <div className="mt-8 flex items-center gap-3 border-t border-white/[0.04] pt-6">
        <button className="btn btn-primary">
          Save settings
        </button>
        <span className="text-[12px] text-slate-700">
          Settings are stored locally. API keys are environment variables.
        </span>
      </div>
    </div>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-white/[0.04] px-4 py-3">
        <div className="label-mono">{title}</div>
      </div>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-slate-200">{label}</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{description}</div>
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={clsx(
        "relative h-6 w-10 flex-shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-accent" : "bg-base-600",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-surface-sm transition-transform duration-200",
          on ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
