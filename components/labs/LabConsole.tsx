"use client";

import { useState } from "react";
import Link from "next/link";
import { Chat } from "@/components/chat/Chat";
import { MobileLabConsole } from "@/components/mobile/MobileLabConsole";
import { MemoryExplorer } from "@/components/memory/MemoryExplorer";
import { AgentsPanel } from "./AgentsPanel";
import { ChatHistorySheet } from "./ChatHistorySheet";
import { useLabConsole } from "./useLabConsole";
import { useAuth } from "@/hooks/useAuth";
import "@/components/dashboard/labs.css";
import "./lab-console.css";

// Lab Console = the AI chat, nested under Command Center. Always opens on a
// fresh chat; past chats are reachable only via the History sheet. The crew
// (Agents panel) and Shared Memory (Memory Explorer) live directly here.
export function LabConsole() {
  const { user } = useAuth();
  const lab = useLabConsole(user?.id);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);

  const tradingEnabled = lab.trading?.traderInCrew ?? false;

  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      {/* Desktop / tablet chat view */}
      <div className="lc-desktop">
        <header className="lx-topbar">
          <div className="lx-topbar-inner lx-topbar-inner--slim lc-topbar">
            <nav className="lc-crumb" aria-label="Breadcrumb">
              <Link href="/labs" className="lc-crumb-link">
                Command Center
              </Link>
              <span className="lc-crumb-sep" aria-hidden="true">
                /
              </span>
              <span className="lc-crumb-here">Lab Console</span>
            </nav>
            <div className="lc-actions">
              <button type="button" className="lc-btn" onClick={() => setHistoryOpen(true)}>
                History
              </button>
              <button type="button" className="lc-btn lc-btn--primary" onClick={lab.newChat}>
                New chat
              </button>
            </div>
          </div>
        </header>

        <main className="lx-main lc-main">
          <div className="lc-layout">
            <div className="lc-chatwrap">
              <Chat
                turns={lab.turns}
                busy={lab.busy}
                onSend={lab.send}
                tradingEnabled={tradingEnabled}
              />
            </div>

            <aside className="lc-rail" aria-label="Lab context">
              <AgentsPanel
                agents={lab.agents}
                statuses={lab.statuses}
                busy={lab.busy}
                tradingEnabled={tradingEnabled}
                variant="desktop"
              />
              <button
                type="button"
                className="lc-mem-btn"
                onClick={() => setMemoryOpen(true)}
              >
                <MemoryIcon />
                <span className="lc-mem-main">
                  <span className="lc-mem-title">Shared memory</span>
                  <span className="lc-mem-sub">
                    {lab.memory.length > 0
                      ? `${lab.memory.length} ${lab.memory.length === 1 ? "entry" : "entries"} in this lab`
                      : "Explore the lab_memory store"}
                  </span>
                </span>
                <span className="lc-mem-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </aside>
          </div>
        </main>
      </div>

      {/* Phone chat-first console */}
      <MobileLabConsole
        turns={lab.turns}
        busy={lab.busy}
        onSend={lab.send}
        statuses={lab.statuses}
        memory={lab.memory}
        agents={lab.agents}
        tradingEnabled={tradingEnabled}
        onNewChat={lab.newChat}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenMemory={() => setMemoryOpen(true)}
      />

      {/* Shared memory (real lab_memory store) + history */}
      <MemoryExplorer
        sessionId={lab.activeChatId}
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
      />
      <ChatHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={lab.history}
        activeChatId={lab.activeChatId}
        onSelect={lab.openChat}
        onNewChat={lab.newChat}
        onDelete={lab.deleteChat}
      />
    </div>
  );
}

function MemoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 5v14" />
    </svg>
  );
}
