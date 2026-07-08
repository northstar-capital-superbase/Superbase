"use client";

import { useRef, useState } from "react";
import type { Attachment, SendFn } from "@/components/chat/Chat";
import "./chat-ui.css";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `att-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Shared chat composer used by both the mobile and desktop Lab Console.
// The "+" button opens a popup with plugins (Web search) and attachment
// actions (Add photo / Add file). Attachments and the active plugin render as
// removable chips above the input, ChatGPT/Claude style.
export function Composer({
  onSend,
  busy,
  variant,
  placeholder = "Message the lab…",
}: {
  onSend: SendFn;
  busy: boolean;
  variant: "mobile" | "desktop";
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasText = input.trim().length > 0;
  const canSend = (hasText || attachments.length > 0) && !busy;

  const addFiles = (files: FileList | null, kind: Attachment["kind"]) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const base: Attachment = {
        id: newId(),
        kind,
        name: file.name,
        size: file.size,
      };
      if (kind === "image") {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : undefined;
          setAttachments((a) => [...a, { ...base, dataUrl }]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments((a) => [...a, base]);
      }
    });
  };

  const removeAttachment = (id: string) =>
    setAttachments((a) => a.filter((x) => x.id !== id));

  const submit = () => {
    if (!canSend) return;
    onSend(input.trim(), { attachments, webSearch });
    setInput("");
    setAttachments([]);
    // Web search stays on across sends (it's a plugin, not an attachment).
  };

  const showTray = attachments.length > 0 || webSearch;

  return (
    <div className={`cmp cmp--${variant}`}>
      {showTray && (
        <div className="cmp-tray">
          {webSearch && (
            <button
              type="button"
              className="cmp-chip cmp-chip--plugin"
              onClick={() => setWebSearch(false)}
              title="Turn off web search"
            >
              <SearchIcon />
              <span>Web search</span>
              <CloseX />
            </button>
          )}
          {attachments.map((a) =>
            a.kind === "image" && a.dataUrl ? (
              <span className="cmp-thumb" key={a.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.dataUrl} alt={a.name} />
                <button
                  type="button"
                  className="cmp-thumb-x"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                >
                  <CloseX />
                </button>
              </span>
            ) : (
              <span className="cmp-chip" key={a.id}>
                <FileIcon />
                <span className="cmp-chip-name">{a.name}</span>
                <span className="cmp-chip-size">{formatSize(a.size)}</span>
                <button
                  type="button"
                  className="cmp-chip-x"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                >
                  <CloseX />
                </button>
              </span>
            ),
          )}
        </div>
      )}

      <div className="cmp-row">
        <div className="cmp-plus-wrap">
          <button
            type="button"
            className={`cmp-plus ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Add attachment or plugin"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <PlusIcon />
          </button>

          {menuOpen && (
            <>
              <div className="cmp-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="cmp-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="cmp-menu-item"
                  onClick={() => {
                    imageInputRef.current?.click();
                    setMenuOpen(false);
                  }}
                >
                  <PhotoIcon />
                  <span>Add photo</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="cmp-menu-item"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMenuOpen(false);
                  }}
                >
                  <FileIcon />
                  <span>Add file</span>
                </button>
                <div className="cmp-menu-sep" />
                <div className="cmp-menu-label">Plugins</div>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={webSearch}
                  className={`cmp-menu-item cmp-menu-item--toggle ${webSearch ? "is-on" : ""}`}
                  onClick={() => {
                    setWebSearch((w) => !w);
                    setMenuOpen(false);
                  }}
                >
                  <SearchIcon />
                  <span>Web search</span>
                  <span className={`cmp-switch ${webSearch ? "is-on" : ""}`} aria-hidden="true">
                    <span className="cmp-switch-knob" />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          aria-label="Message the lab"
        />

        <button
          type="button"
          className={`cmp-send ${canSend ? "is-active" : ""}`}
          onClick={submit}
          disabled={!canSend}
          aria-label={hasText || attachments.length > 0 ? "Send message" : "Voice input"}
        >
          {busy ? (
            <span className="cmp-send-spinner" aria-hidden="true" />
          ) : hasText || attachments.length > 0 ? (
            <ArrowUpIcon />
          ) : (
            <MicIcon />
          )}
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files, "image");
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files, "file");
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
function PhotoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function CloseX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
