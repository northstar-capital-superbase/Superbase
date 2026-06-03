"use client";

import { useCallback, useEffect, useState } from "react";

export interface LabSession {
  id: string;
  name: string;
  createdAt: string;
}

const KEY = "northstar.sessions.v1";
// Seeded so any memory already stored under "default" stays reachable.
const DEFAULT: LabSession = {
  id: "default",
  name: "Default Lab",
  createdAt: new Date(0).toISOString(),
};

interface Persisted {
  sessions: LabSession[];
  activeId: string;
}

// Manages the list of labs (sessions) in localStorage. Memory content itself
// lives server-side keyed by session id (Supabase/in-memory) — this just tracks
// the names and which lab is active, so the lab list is a local convenience
// while the data persists wherever the backend does.
export function useSessions() {
  const [sessions, setSessions] = useState<LabSession[]>([DEFAULT]);
  const [activeId, setActiveId] = useState<string>("default");

  // Hydrate after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed.sessions?.length) {
        setSessions(parsed.sessions);
        const valid = parsed.sessions.some((s) => s.id === parsed.activeId);
        setActiveId(valid ? parsed.activeId : parsed.sessions[0].id);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persist = useCallback((next: LabSession[], active: string) => {
    setSessions(next);
    setActiveId(active);
    try {
      localStorage.setItem(KEY, JSON.stringify({ sessions: next, activeId: active }));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const create = useCallback(
    (name?: string) => {
      const session: LabSession = {
        id: `lab-${Date.now().toString(36)}`,
        name: name?.trim() || `Lab ${sessions.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      persist([...sessions, session], session.id);
      return session;
    },
    [sessions, persist],
  );

  const remove = useCallback(
    (id: string) => {
      if (sessions.length <= 1) return; // always keep one lab
      const next = sessions.filter((s) => s.id !== id);
      persist(next, activeId === id ? next[0].id : activeId);
    },
    [sessions, activeId, persist],
  );

  const setActive = useCallback(
    (id: string) => persist(sessions, id),
    [sessions, persist],
  );

  return { sessions, activeId, create, remove, setActive };
}
