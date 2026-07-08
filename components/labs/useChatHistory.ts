"use client";

import { useCallback, useEffect, useState } from "react";

// Lightweight, client-only history of past Lab Console chats. Each chat is a
// crew session id (already used by the memory API) plus a display title. Stored
// in localStorage — no backend/API changes. This only tracks which sessions the
// user has started so they can be reopened from the History sheet.
export interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
}

const KEY = "northstar.labs.chatHistory";
const MAX = 40;

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
