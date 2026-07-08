"use client";

import { BottomSheet } from "@/components/mobile/BottomSheet";
import type { ChatSummary } from "./useChatHistory";
import "./lab-console.css";

export function ChatHistorySheet({
  open,
  onClose,
  history,
  activeChatId,
  onSelect,
  onNewChat,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  history: ChatSummary[];
  activeChatId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Chat History"
      subtitle={`${history.length} ${history.length === 1 ? "conversation" : "conversations"}`}
    >
      <button
        type="button"
        className="lc-newchat-row"
        onClick={() => {
          onNewChat();
          onClose();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New chat
      </button>

      <div className="mrows">
        {history.length === 0 ? (
          <p className="mrows-empty">No past chats yet. Start a new conversation.</p>
        ) : (
          history.map((c) => (
            <div
              className={`mrow lc-history-row ${c.id === activeChatId ? "is-active" : ""}`}
              key={c.id}
            >
              <button
                type="button"
                className="lc-history-open"
                onClick={() => {
                  onSelect(c.id);
                  onClose();
                }}
              >
                <span className="mrow-main">
                  <span className="mrow-title">{c.title}</span>
                  <span className="mrow-detail">
                    {new Date(c.createdAt).toLocaleString()}
                    {c.id === activeChatId ? " · current" : ""}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="lc-history-del"
                aria-label="Delete chat"
                onClick={() => onDelete(c.id)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </BottomSheet>
  );
}
