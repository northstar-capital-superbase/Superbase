// Northstar OS — Settings model. Client-side preferences persisted to
// localStorage; integration/runtime state is read live, never hardcoded.

export type PrimaryModel = "gpt-5.5" | "claude" | "gemini" | "auto";
export type Reasoning = "fast" | "balanced" | "deep";
export type AgentMode = "single" | "multi";
export type TradingMode = "disabled" | "paper" | "live";

// ── Appearance vocabulary ────────────────────────────────────────────────────
export type ThemeName =
  | "midnight"
  | "graphite"
  | "nord"
  | "dracula"
  | "solarized-dark"
  | "terminal-green"
  | "ocean-blue"
  | "northstar-purple";
export type AccentKey =
  | "auto"
  | "blue"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan";
export type Radius = "sharp" | "default" | "round";
export type Density = "compact" | "cozy" | "comfortable";
export type FontSize = "small" | "default" | "large";
export type SidebarMode = "expanded" | "collapsed";
export type BackgroundStyle = "aurora" | "solid" | "grid";
export type ChatBubbleStyle = "modern" | "minimal" | "solid";

// ── Other control-center vocabulary ──────────────────────────────────────────
export type LaunchView = "command" | "console";

export interface AppearanceSettings {
  theme: ThemeName;
  accent: AccentKey;
  radius: Radius;
  density: Density;
  fontSize: FontSize;
  animations: boolean;
  reducedMotion: boolean;
  sidebar: SidebarMode;
  glass: boolean;
  background: BackgroundStyle;
  agentColors: boolean;
  chatBubbles: ChatBubbleStyle;
}

export interface NorthstarSettings {
  general: {
    launchView: LaunchView;
    showTips: boolean;
    sendOnEnter: boolean;
  };
  ai: {
    model: PrimaryModel;
    reasoning: Reasoning;
    agentMode: AgentMode;
  };
  agents: {
    showTrace: boolean;
    autoOpenTrace: boolean;
    parallelHint: boolean;
  };
  performance: {
    streaming: boolean;
    prefetch: boolean;
    reduceGlass: boolean;
  };
  notifications: {
    runComplete: boolean;
    sound: boolean;
    errors: boolean;
  };
  privacy: {
    persistHistory: boolean;
    telemetry: boolean;
  };
  developer: {
    devMode: boolean;
    showTokens: boolean;
    verboseLogging: boolean;
  };
  experimental: {
    voiceInput: boolean;
    multiLab: boolean;
    inlineMemory: boolean;
  };
  trading: {
    mode: TradingMode;
    dailyLossLimit: number;
    maxPositionSize: number;
    autoExecution: boolean;
  };
  appearance: AppearanceSettings;
}

export const SETTINGS_KEY = "northstar.settings.v2";
export const ACTIVE_SETTINGS_USER_KEY = "northstar.settings.active-user";

export function settingsKeyForUser(userId: string): string {
  return `${SETTINGS_KEY}.${userId}`;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "midnight",
  accent: "auto",
  radius: "default",
  density: "cozy",
  fontSize: "default",
  animations: true,
  reducedMotion: false,
  sidebar: "expanded",
  glass: true,
  background: "aurora",
  agentColors: true,
  chatBubbles: "modern",
};

export const DEFAULT_SETTINGS: NorthstarSettings = {
  general: { launchView: "command", showTips: true, sendOnEnter: true },
  ai: { model: "auto", reasoning: "balanced", agentMode: "multi" },
  agents: { showTrace: true, autoOpenTrace: false, parallelHint: false },
  performance: { streaming: true, prefetch: true, reduceGlass: false },
  notifications: { runComplete: true, sound: false, errors: true },
  privacy: { persistHistory: true, telemetry: false },
  developer: { devMode: false, showTokens: true, verboseLogging: false },
  experimental: { voiceInput: false, multiLab: false, inlineMemory: false },
  trading: {
    mode: "disabled",
    dailyLossLimit: 500,
    maxPositionSize: 1000,
    autoExecution: false,
  },
  appearance: DEFAULT_APPEARANCE,
};

// ── Accents ──────────────────────────────────────────────────────────────────
export interface AccentDef {
  key: AccentKey;
  label: string;
  color: string;
  bright: string;
}

// "auto" follows the active theme's native accent (no inline override).
export const ACCENTS: AccentDef[] = [
  { key: "auto", label: "Theme default", color: "var(--os-accent)", bright: "var(--os-accent-bright)" },
  { key: "blue", label: "Northstar Blue", color: "#6e8bff", bright: "#8aa6ff" },
  { key: "violet", label: "Violet", color: "#a78bfa", bright: "#c0a9ff" },
  { key: "cyan", label: "Cyan", color: "#38bdf8", bright: "#7dd3fc" },
  { key: "emerald", label: "Emerald", color: "#5bd6a8", bright: "#7fe6c0" },
  { key: "amber", label: "Amber", color: "#e2b17c", bright: "#f0c79a" },
  { key: "rose", label: "Rose", color: "#ff7a8a", bright: "#ff9aa6" },
];

// ── Themes ───────────────────────────────────────────────────────────────────
// `preview` colors drive the theme-card swatches; the authoritative tokens live
// in globals.css under :root[data-theme="…"].
export interface ThemeDef {
  name: ThemeName;
  label: string;
  hint: string;
  preview: { bg: string; surface: string; accent: string; text: string };
}

export const THEMES: ThemeDef[] = [
  { name: "midnight", label: "Midnight", hint: "The native Northstar dark", preview: { bg: "#08090d", surface: "#13161f", accent: "#6e8bff", text: "#f2f4f9" } },
  { name: "graphite", label: "Graphite", hint: "Neutral, low-chroma", preview: { bg: "#101114", surface: "#1b1d22", accent: "#9aa4b8", text: "#eceef2" } },
  { name: "nord", label: "Nord", hint: "Arctic blue-grey", preview: { bg: "#2e3440", surface: "#3b4252", accent: "#88c0d0", text: "#eceff4" } },
  { name: "dracula", label: "Dracula", hint: "Vivid on deep plum", preview: { bg: "#282a36", surface: "#343746", accent: "#bd93f9", text: "#f8f8f2" } },
  { name: "solarized-dark", label: "Solarized Dark", hint: "Warm, balanced", preview: { bg: "#002b36", surface: "#073642", accent: "#268bd2", text: "#eee8d5" } },
  { name: "terminal-green", label: "Terminal Green", hint: "Phosphor CRT", preview: { bg: "#08100a", surface: "#0f1a12", accent: "#3ddc84", text: "#c8f5d4" } },
  { name: "ocean-blue", label: "Ocean Blue", hint: "Deep-sea calm", preview: { bg: "#0a1420", surface: "#102236", accent: "#38bdf8", text: "#e6f0fa" } },
  { name: "northstar-purple", label: "Northstar Purple", hint: "Signature nebula", preview: { bg: "#0d0a14", surface: "#191024", accent: "#a78bfa", text: "#f1ecfb" } },
];

// ── Applying appearance to the DOM ───────────────────────────────────────────
// Central, dependency-free routine reused by the provider and the pre-hydration
// inline script (kept as a serialisable string) so first paint matches state.
export const RADIUS_VALUES: Record<Radius, { lg: string; md: string; sm: string }> = {
  sharp: { lg: "8px", md: "6px", sm: "4px" },
  default: { lg: "16px", md: "12px", sm: "9px" },
  round: { lg: "22px", md: "16px", sm: "12px" },
};

export const FONT_SCALE: Record<FontSize, string> = {
  small: "0.92",
  default: "1",
  large: "1.1",
};

// Base background per theme — mirrors --os-bg in globals.css. Used to paint the
// root element instantly (pre-hydration + on live theme change) to avoid a
// white flash before the stylesheet applies.
export const THEME_BG: Record<ThemeName, string> = {
  midnight: "#08090d",
  graphite: "#101114",
  nord: "#2e3440",
  dracula: "#282a36",
  "solarized-dark": "#002b36",
  "terminal-green": "#08100a",
  "ocean-blue": "#0a1420",
  "northstar-purple": "#0d0a14",
};

export function accentColor(key: AccentKey): { color: string; bright: string } | null {
  if (key === "auto") return null;
  const a = ACCENTS.find((x) => x.key === key);
  return a ? { color: a.color, bright: a.bright } : null;
}
