"use client";

import { useState } from "react";
import clsx from "clsx";
import type { LabSession } from "./useSessions";

// Header dropdown to switch between labs, create a new one, or delete one.
export function SessionSwitcher({
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
    <div className="lx-switch">
      <button className="lx-switch-btn" onClick={() => setOpen((o) => !o)}>
        <span className="lx-dot on" />
        <span className="lx-switch-name">{active?.name ?? "Lab"}</span>
        <span style={{ color: "var(--text-3)" }}>▾</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 20 }}
            onClick={() => setOpen(false)}
          />
          <div className="lx-menu">
            <div className="lx-menu-label">Labs</div>
            <div style={{ maxHeight: 256, overflowY: "auto" }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    "lx-menu-item",
                    s.id === activeId && "is-active",
                  )}
                >
                  <button
                    className="name"
                    onClick={() => {
                      onSwitch(s.id);
                      setOpen(false);
                    }}
                  >
                    <span className="t">{s.name}</span>
                    <span className="id lx-mono">{s.id}</span>
                  </button>
                  {sessions.length > 1 && (
                    <button
                      className="lx-menu-del"
                      onClick={() => onRemove(s.id)}
                      title="Delete lab (and its memory)"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form
              className="lx-menu-form"
              onSubmit={(e) => {
                e.preventDefault();
                onCreate(name);
                setName("");
                setOpen(false);
              }}
            >
              <input
                className="lx-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New lab name…"
              />
              <button type="submit" className="lx-btn lx-btn-primary">
                + Add
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
