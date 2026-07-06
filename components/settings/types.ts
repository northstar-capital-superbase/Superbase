// Northstar OS — Settings model. Client-side preferences persisted to
// localStorage; integration/runtime state is read live, never hardcoded.

export type PrimaryModel = "gpt-5.5" | "claude" | "gemini" | "auto";
export type Reasoning = "fast" | "balanced" | "deep";
export type AgentMode = "single" | "multi";
export type TradingMode = "disabled" | "paper" | "live";
export type ThemeMode = "dark" | "light" | "system";
export type AccentKey = "blue" | "violet" | "emerald" | "amber" | "rose";

export interface NorthstarSettings {
  ai: {
    model: PrimaryModel;
    reasoning: Reasoning;
    agentMode: AgentMode;
  };
  trading: {
    mode: TradingMode;
    dailyLossLimit: number;
    maxPositionSize: number;
    autoExecution: boolean;
  };
  appearance: {
    theme: ThemeMode;
    accent: AccentKey;
  };
}

export const SETTINGS_KEY = "northstar.settings.v1";

export const DEFAULT_SETTINGS: NorthstarSettings = {
  ai: { model: "auto", reasoning: "balanced", agentMode: "multi" },
  trading: {
    mode: "disabled",
    dailyLossLimit: 500,
    maxPositionSize: 1000,
    autoExecution: false,
  },
  appearance: { theme: "dark", accent: "blue" },
};

export interface AccentDef {
  key: AccentKey;
  label: string;
  color: string;
  bright: string;
}

export const ACCENTS: AccentDef[] = [
  { key: "blue", label: "Northstar Blue", color: "#6e8bff", bright: "#8aa6ff" },
  { key: "violet", label: "Violet", color: "#a78bfa", bright: "#c0a9ff" },
  { key: "emerald", label: "Emerald", color: "#5bd6a8", bright: "#7fe6c0" },
  { key: "amber", label: "Amber", color: "#e2b17c", bright: "#f0c79a" },
  { key: "rose", label: "Rose", color: "#ff7a8a", bright: "#ff9aa6" },
];
