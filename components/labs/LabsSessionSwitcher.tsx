"use client";

import { useState } from "react";
import clsx from "clsx";
import type { LabSession } from "@/components/session/useSessions";

export function LabsSessionSwitcher({
  sessions,
  activeId,
  onSwitch,
  onCreate,
  onRemove,
}: {
  sessions: LabSession[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: (name?: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const active = sessions.find((s) => s.id === activeId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="labs-session-trigger"
      >
        <span className="ns-live" />
        <span className="max-w-[180px] truncate">{active?.name ?? "Lab"}</span>
        <span style={{ color: "var(--ns-text-3)" }}>▾</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="panel labs-session-menu absolute right-0 z-20 mt-2 w-72 p-3">
            <div className="ns-mono-tag" style={{ marginBottom: 8 }}>
              Workspaces
            </div>
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5",
                    s.id === activeId
                      ? "bg-white/5"
                      : "hover:bg-white/[0.03]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSwitch(s.id);
                      setOpen(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div
                      className="truncate text-[13px]"
                      style={{ color: "var(--ns-text)" }}
                    >
                      {s.name}
                    </div>
                    <div className="truncate ns-mono-idx">{s.id}</div>
                  </button>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      title="Delete workspace"
                      className="opacity-0 transition group-hover:opacity-100"
                      style={{ color: "var(--ns-text-3)" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onCreate(name);
                setName("");
                setOpen(false);
              }}
              className="mt-3 flex items-center gap-2 border-t pt-3"
              style={{ borderColor: "var(--ns-line)" }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New workspace…"
                className="min-w-0 flex-1 rounded-lg border px-2.5 py-2 text-[12px] focus:outline-none"
                style={{
                  borderColor: "var(--ns-line)",
                  background: "var(--ns-bg)",
                  color: "var(--ns-text)",
                }}
              />
              <button type="submit" className="ns-btn ns-btn-primary" style={{ padding: "8px 12px", fontSize: 12 }}>
                Add
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
