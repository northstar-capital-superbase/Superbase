"use client";

import { useState } from "react";
import Link from "next/link";
import { Chat } from "@/components/chat/Chat";
import { MobileLabConsole } from "@/components/mobile/MobileLabConsole";
import { MemoryContextChip } from "@/components/mobile/MemoryContextChip";
import { SharedMemorySheet } from "@/components/mobile/SharedMemorySheet";
import { toMemoryRows } from "@/components/mobile/mobileData";
import { ChatHistorySheet } from "./ChatHistorySheet";
import { useLabConsole } from "./useLabConsole";
import "@/components/dashboard/labs.css";
import "./lab-console.css";

// Lab Console = the AI chat, nested under Command Center. Always opens on a
// fresh chat; past chats are reachable only via the History sheet. Desktop
// shows a focused chat view; phones get the chat-first MobileLabConsole.
export function LabConsole() {
  const lab = useLabConsole();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);

  const memoryCount = toMemoryRows(lab.memory).length;
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
          <div className="lc-chatwrap">
            <div className="lc-chip-row">
              <MemoryContextChip count={memoryCount} onOpen={() => setMemoryOpen(true)} />
            </div>
            <Chat
              turns={lab.turns}
              busy={lab.busy}
              onSend={lab.send}
              tradingEnabled={tradingEnabled}
            />
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
      />

      {/* Shared bottom sheets */}
      <SharedMemorySheet
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        memory={lab.memory}
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
