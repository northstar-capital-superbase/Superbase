"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatTurn } from "@/components/chat/Chat";

// Lightweight, client-only history of past Lab Console chats. Each chat is a
// crew session id (already used by the memory API) plus a display title and its
// transcript, stored in localStorage. This is deliberately client-side: the
// default in-memory backend does not persist a session's transcript across
// requests, and we must not touch memory storage — so history/restore lives
// entirely in the browser (no backend/API changes).
export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
}

const MAX = 40;

// Keys are namespaced by the authenticated user's id so chat history and
// transcripts never leak between accounts on a shared browser — User B
// signing in on the same device gets an entirely separate key space, even
// without an explicit clear. `scope` defaults to "anon" only for the
// (unauthenticated, Supabase-not-configured) local-dev fallback.
function scopeOf(userId?: string | null): string {
  return userId ?? "anon";
}
const keyFor = (userId?: string | null) => `northstar.labs.chatHistory.${scopeOf(userId)}`;
const transcriptKeyFor = (userId: string | null | undefined, id: string) =>
  `northstar.labs.chat.${scopeOf(userId)}.${id}`;

// Per-chat transcript persistence (client-only).
export function saveTranscript(userId: string | null | undefined, id: string, turns: ChatTurn[]): void {
  try {
    localStorage.setItem(transcriptKeyFor(userId, id), JSON.stringify(turns));
  } catch {
    // ignore quota/unavailable storage
  }
}

export function loadTranscript(userId: string | null | undefined, id: string): ChatTurn[] {
  try {
    const raw = localStorage.getItem(transcriptKeyFor(userId, id));
    return raw ? (JSON.parse(raw) as ChatTurn[]) : [];
  } catch {
    return [];
  }
}

export function deleteTranscript(userId: string | null | undefined, id: string): void {
  try {
    localStorage.removeItem(transcriptKeyFor(userId, id));
  } catch {
    // ignore
  }
}

export function useChatHistory(userId?: string | null) {
  const [history, setHistory] = useState<ChatSummary[]>([]);
  const key = keyFor(userId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setHistory(raw ? (JSON.parse(raw) as ChatSummary[]) : []);
    } catch {
      // ignore malformed/unavailable storage
    }
  }, [key]);

  const write = useCallback(
    (next: ChatSummary[]) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota/unavailable storage
      }
      return next;
    },
    [key],
  );

  const addChat = useCallback(
    (chat: ChatSummary) => {
      setHistory((prev) =>
        write([chat, ...prev.filter((c) => c.id !== chat.id)].slice(0, MAX)),
      );
    },
    [write],
  );

  const removeChat = useCallback(
    (id: string) => {
      setHistory((prev) => write(prev.filter((c) => c.id !== id)));
    },
    [write],
  );

  return { history, addChat, removeChat };
}

// Turn the first user message into a short chat title.
export function deriveChatTitle(task: string): string {
  const clean = task.replace(/\s+/g, " ").trim();
  if (clean.length <= 46) return clean || "New chat";
  return `${clean.slice(0, 44)}…`;
}
