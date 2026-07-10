"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Shared runtime probe: one `RuntimeStatusProvider` owns the real
// /api/health + /api/trading reads; `useRuntimeStatus()` is the consumer
// hook. Mounted once in OsShell (wraps the sidebar + every OS page, so the
// sidebar footer and Connections share one fetch and one cache instead of
// each mounting an independent effect. Calling `refresh()` from any consumer
// (e.g. Connections' "Run checks") updates every other consumer at once,
// including the sidebar. Mirrors the useSettingsContext pattern already in
// this codebase (context + a hook that throws outside its provider).

export interface HealthPayload {
  ok: boolean;
  provider: string | null;
  model: string | null;
  memory: "supabase" | "in-memory";
  configured: boolean;
}

export interface TradingPayload {
  ok: boolean;
  enabled: boolean;
  endpoint?: string;
  mode?: string;
  maxOrderUsd?: number;
  error?: string;
}

export interface RuntimeStatus {
  /** True once the first probe round-trip has settled (ok or not). */
  loaded: boolean;
  /** Raw payloads for surfaces that need the full shape (Connections). */
  health: HealthPayload | null;
  trading: TradingPayload | null;
  /** Distilled fields for compact surfaces (sidebar footer). */
  reachable: boolean;
  provider: string | null;
  model: string | null;
  configured: boolean;
  memory: "supabase" | "in-memory" | null;
  tradingEnabled: boolean;
  tradingMode: string | null;
  /** Re-run both probes — updates every consumer of the same provider. */
  refresh: () => Promise<void>;
}

const RuntimeStatusContext = createContext<RuntimeStatus | null>(null);

export function RuntimeStatusProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [trading, setTrading] = useState<TradingPayload | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const [h, t] = await Promise.allSettled([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/trading").then((r) => r.json()),
    ]);
    if (!mounted.current) return;
    setHealth(h.status === "fulfilled" ? (h.value as HealthPayload) : null);
    setTrading(t.status === "fulfilled" ? (t.value as TradingPayload) : null);
    setLoaded(true);
  }, []);

  // The single initial /api/health + /api/trading request pair for every
  // consumer under this provider — runs once per mount, not once per hook call.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<RuntimeStatus>(
    () => ({
      loaded,
      health,
      trading,
      reachable: health !== null,
      provider: health?.provider ?? null,
      model: health?.model ?? null,
      configured: health?.configured ?? false,
      memory: health?.memory ?? null,
      tradingEnabled: trading?.enabled ?? false,
      tradingMode: trading?.mode ?? null,
      refresh,
    }),
    [loaded, health, trading, refresh],
  );

  return createElement(RuntimeStatusContext.Provider, { value }, children);
}

export function useRuntimeStatus(): RuntimeStatus {
  const ctx = useContext(RuntimeStatusContext);
  if (!ctx) {
    throw new Error("useRuntimeStatus must be used within <RuntimeStatusProvider>");
  }
  return ctx;
}
