"use client";

import { useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageAttachments } from "./MessageAttachments";
import { AgentTrace } from "./AgentTrace";
import { useSettings } from "@/components/settings/useSettings";
import type { ChatTurn } from "@/components/chat/Chat";
import type { CrewRun } from "@/components/shared";

// Shared message thread rendered by both the desktop Chat and the mobile Lab
// Console. Bubble structure, the agent-trace toggle, and glyphs live here once;
// each surface keeps only its own chrome (scroll container, composer, panels)
// and passes a variant for its surface-specific class names.

type Variant = "desktop" | "mobile";

const CLS: Record<
  Variant,
  { user: string; userInner: string; userText: string; ai: string }
> = {
  desktop: {
    user: "lx-bubble-user",
    userInner: "lx-bubble-user-inner",
    userText: "lx-bubble-user-text",
    ai: "lx-fadeup ai-turn",
  },
  mobile: {
    user: "mlc-bubble mlc-bubble--user",
    userInner: "mlc-user-inner",
    userText: "mlc-user-text",
    ai: "mlc-bubble mlc-bubble--ai ai-turn",
  },
};

export function MessageThread({
  turns,
  variant,
}: {
  turns: ChatTurn[];
  variant: Variant;
}) {
  return (
    <>
      {turns.map((t) =>
        t.role === "user" ? (
          <UserBubble key={t.id} turn={t} variant={variant} />
        ) : (
          <AssistantBubble
            key={t.id}
            text={t.content}
            run={t.run}
            variant={variant}
          />
        ),
      )}
    </>
  );
}

function UserBubble({ turn, variant }: { turn: ChatTurn; variant: Variant }) {
  const c = CLS[variant];
  return (
    <div className={c.user}>
      <div className={c.userInner}>
        {turn.attachments && <MessageAttachments items={turn.attachments} />}
        {turn.content && <span className={c.userText}>{turn.content}</span>}
        {turn.webSearch && (
          <span className="msg-plugin-tag">
            <SearchGlyph /> Web search
          </span>
        )}
      </div>
    </div>
  );
}

function AssistantBubble({
  text,
  run,
  variant,
}: {
  text: string;
  run?: CrewRun;
  variant: Variant;
}) {
  const { settings } = useSettings();
  const showTrace = settings.agents.showTrace;
  const [open, setOpen] = useState(settings.agents.autoOpenTrace);
  return (
    <div className={CLS[variant].ai}>
      <span className="ai-avatar" aria-hidden="true">
        <NorthstarMark size={variant === "mobile" ? 18 : 16} dot={variant === "mobile"} />
      </span>
      <div className="ai-body">
        <div className="ai-name">Northstar</div>
        <MessageContent text={text} />
        {run && showTrace && (
          <button
            className="lx-trace-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <Caret open={open} />
            {open ? "Hide" : "Show"} agent trace ({run.specialistResults.length}{" "}
            specialists)
          </button>
        )}
        {run && showTrace && open && <AgentTrace run={run} />}
      </div>
    </div>
  );
}

export function NorthstarMark({ size = 16, dot = false }: { size?: number; dot?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {dot && <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.22)" />}
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : undefined,
        transition: "transform 150ms ease",
      }}
    >
      <path d="M2 3.5 5 6.5 8 3.5" />
    </svg>
  );
}
