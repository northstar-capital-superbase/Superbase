"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACCENTS,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  type NorthstarSettings,
} from "./types";

// Two-level deep merge for the settings shape (sections of flat values).
function hydrate(raw: string | null): NorthstarSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const p = JSON.parse(raw) as Partial<NorthstarSettings>;
    return {
      ai: { ...DEFAULT_SETTINGS.ai, ...p.ai },
      trading: { ...DEFAULT_SETTINGS.trading, ...p.trading },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...p.appearance },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Persisted settings with section-scoped updates and live theme/accent apply.
export function useSettings() {
  const [settings, setSettings] = useState<NorthstarSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

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
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } catch {
          /* storage may be unavailable */
        }
        return next;
      });
    },
    [],
  );

  // Apply accent + theme to the document so the choice is reflected live.
  // Writes the OS-surface tokens (--os-*) only — the marketing homepage owns
  // the separate --ns-* namespace and must stay visually unchanged.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const accent = ACCENTS.find((a) => a.key === settings.appearance.accent);
    if (accent) {
      root.style.setProperty("--os-accent", accent.color);
      root.style.setProperty("--os-accent-bright", accent.bright);
    }
    const t = settings.appearance.theme;
    const resolved =
      t === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : t;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }, [ready, settings.appearance.accent, settings.appearance.theme]);

  return { settings, update, ready };
}
