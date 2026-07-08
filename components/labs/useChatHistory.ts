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

const KEY = "northstar.labs.chatHistory";
const TKEY = (id: string) => `northstar.labs.chat.${id}`;
const MAX = 40;

// Per-chat transcript persistence (client-only).
export function saveTranscript(id: string, turns: ChatTurn[]): void {
  try {
    localStorage.setItem(TKEY(id), JSON.stringify(turns));
  } catch {
    // ignore quota/unavailable storage
  }
}

export function loadTranscript(id: string): ChatTurn[] {
  try {
    const raw = localStorage.getItem(TKEY(id));
    return raw ? (JSON.parse(raw) as ChatTurn[]) : [];
  } catch {
    return [];
  }
}

export function deleteTranscript(id: string): void {
  try {
    localStorage.removeItem(TKEY(id));
  } catch {
    // ignore
  }
}

export function useChatHistory() {
  const [history, setHistory] = useState<ChatSummary[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHistory(JSON.parse(raw) as ChatSummary[]);
    } catch {
      // ignore malformed/unavailable storage
    }
  }, []);

  const write = (next: ChatSummary[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore quota/unavailable storage
    }
    return next;
  };

  const addChat = useCallback((chat: ChatSummary) => {
    setHistory((prev) =>
      write([chat, ...prev.filter((c) => c.id !== chat.id)].slice(0, MAX)),
    );
  }, []);

  const removeChat = useCallback((id: string) => {
    setHistory((prev) => write(prev.filter((c) => c.id !== id)));
  }, []);

  return { history, addChat, removeChat };
}

// Turn the first user message into a short chat title.
export function deriveChatTitle(task: string): string {
  const clean = task.replace(/\s+/g, " ").trim();
  if (clean.length <= 46) return clean || "New chat";
  return `${clean.slice(0, 44)}…`;
}
