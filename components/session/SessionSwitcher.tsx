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
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-white/5 bg-base-750/60 px-3 py-1.5 text-[13px] text-slate-200 transition hover:border-accent/40"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="max-w-[160px] truncate font-medium">
          {active?.name ?? "Lab"}
        </span>
        <span className="text-slate-500">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="panel absolute right-0 z-20 mt-1.5 w-72 p-2">
            <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Labs
            </div>
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5",
                    s.id === activeId ? "bg-accent/15" : "hover:bg-white/5",
                  )}
                >
                  <button
                    onClick={() => {
                      onSwitch(s.id);
                      setOpen(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-[13px] text-slate-200">{s.name}</div>
                    <div className="truncate font-mono text-[10px] text-slate-600">
                      {s.id}
                    </div>
                  </button>
                  {sessions.length > 1 && (
                    <button
                      onClick={() => onRemove(s.id)}
                      title="Delete lab (and its memory)"
                      className="text-slate-500 opacity-100 transition hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
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
              className="mt-2 flex items-center gap-1.5 border-t border-white/5 pt-2"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New lab name…"
                className="min-w-0 flex-1 rounded-md border border-white/5 bg-base-750/60 px-2 py-1.5 text-[12px] text-slate-200 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-medium text-base-900 transition hover:bg-accent-soft"
              >
                + Add
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
