"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  ACTIVE_SETTINGS_USER_KEY,
  FONT_SCALE,
  RADIUS_VALUES,
  settingsKeyForUser,
  THEME_BG,
  accentColor,
  type AppearanceSettings,
  type NorthstarSettings,
} from "./types";
import { useAuth } from "@/hooks/useAuth";

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
  root.style.backgroundColor = THEME_BG[a.theme] ?? THEME_BG.midnight;
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
  const { ready: authReady, user } = useAuth();
  const userId = user?.id ?? null;
  const [settings, setSettings] = useState<NorthstarSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const storageKey = userId ? settingsKeyForUser(userId) : null;

  const persist = useCallback(
    (next: NorthstarSettings) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        localStorage.setItem(ACTIVE_SETTINGS_USER_KEY, userId!);
      } catch {
        /* storage may be unavailable */
      }
    },
    [storageKey, userId],
  );

  useEffect(() => {
    if (!authReady) return;
    setReady(false);
    try {
      setSettings(
        storageKey ? hydrate(localStorage.getItem(storageKey)) : DEFAULT_SETTINGS,
      );
      if (userId) localStorage.setItem(ACTIVE_SETTINGS_USER_KEY, userId);
      else localStorage.removeItem(ACTIVE_SETTINGS_USER_KEY);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
    setReady(true);
  }, [authReady, storageKey, userId]);

  const update = useCallback(
    <S extends keyof NorthstarSettings>(
      section: S,
      patch: Partial<NorthstarSettings[S]>,
    ) => {
      setSettings((prev) => {
        const next = { ...prev, [section]: { ...prev[section], ...patch } };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const replaceAppearance = useCallback((a: AppearanceSettings) => {
    setSettings((prev) => {
      const next = { ...prev, appearance: a };
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, [persist]);

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
