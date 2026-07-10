"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Shared runtime probe: one hook for the real /api/health + /api/trading
// reads, reused by the OS sidebar footer and the Connections cockpit so the
// same fetch/derive logic isn't duplicated per surface.

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
  /** Re-run both probes (used by Connections' refresh action). */
  refresh: () => Promise<void>;
}

export function useRuntimeStatus(): RuntimeStatus {
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
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
  };
}
