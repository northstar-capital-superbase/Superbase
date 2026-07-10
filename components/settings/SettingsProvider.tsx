"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  FONT_SCALE,
  RADIUS_VALUES,
  SETTINGS_KEY,
  accentColor,
  type AppearanceSettings,
  type NorthstarSettings,
} from "./types";

// Deep-ish merge that tolerates partial / legacy persisted shapes.
function hydrate(raw: string | null): NorthstarSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const p = JSON.parse(raw) as Partial<NorthstarSettings>;
    const merged = {} as NorthstarSettings;
    (Object.keys(DEFAULT_SETTINGS) as (keyof NorthstarSettings)[]).forEach((k) => {
      // @ts-expect-error index merge of matching section shapes
      merged[k] = { ...DEFAULT_SETTINGS[k], ...(p[k] ?? {}) };
    });
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Apply the appearance settings to a root element (documentElement in the app,
// or a scoped container for the live preview). Kept side-effect-only and pure of
// React so the pre-hydration inline script can mirror it.
export function applyAppearance(root: HTMLElement, a: AppearanceSettings): void {
  root.dataset.theme = a.theme;
  root.dataset.density = a.density;
  root.dataset.radius = a.radius;
  root.dataset.bg = a.background;
  root.dataset.glass = a.glass ? "on" : "off";
  root.dataset.bubbles = a.chatBubbles;
  root.dataset.agentColors = a.agentColors ? "on" : "off";
  root.dataset.motion = a.animations && !a.reducedMotion ? "full" : "reduced";

  const r = RADIUS_VALUES[a.radius];
  root.style.setProperty("--os-r-lg", r.lg);
  root.style.setProperty("--os-r", r.md);
  root.style.setProperty("--os-r-sm", r.sm);
  root.style.setProperty("--os-font-scale", FONT_SCALE[a.fontSize]);

  const accent = accentColor(a.accent);
  if (accent) {
    root.style.setProperty("--os-accent", accent.color);
    root.style.setProperty("--os-accent-bright", accent.bright);
  } else {
    // "auto" — let the theme's native accent (from CSS) take over.
    root.style.removeProperty("--os-accent");
    root.style.removeProperty("--os-accent-bright");
  }
}

interface SettingsContextValue {
  settings: NorthstarSettings;
  update: <S extends keyof NorthstarSettings>(
    section: S,
    patch: Partial<NorthstarSettings[S]>,
  ) => void;
  replaceAppearance: (a: AppearanceSettings) => void;
  reset: () => void;
  ready: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NorthstarSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const persist = useRef((s: NorthstarSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      /* storage may be unavailable */
    }
  });

  useEffect(() => {
    setSettings(hydrate(localStorage.getItem(SETTINGS_KEY)));
    setReady(true);
  }, []);

  const update = useCallback(
    <S extends keyof NorthstarSettings>(
      section: S,
      patch: Partial<NorthstarSettings[S]>,
    ) => {
      setSettings((prev) => {
        const next = { ...prev, [section]: { ...prev[section], ...patch } };
        persist.current(next);
        return next;
      });
    },
    [],
  );

  const replaceAppearance = useCallback((a: AppearanceSettings) => {
    setSettings((prev) => {
      const next = { ...prev, appearance: a };
      persist.current(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist.current(DEFAULT_SETTINGS);
  }, []);

  // Reflect appearance to the document on every change (and after hydration).
  useEffect(() => {
    if (!ready) return;
    applyAppearance(document.documentElement, settings.appearance);
  }, [ready, settings.appearance]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, update, replaceAppearance, reset, ready }),
    [settings, update, replaceAppearance, reset, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettingsContext must be used within <SettingsProvider>");
  }
  return ctx;
}
