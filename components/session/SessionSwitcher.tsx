"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button, Input, Menu } from "@/components/ui";
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
    <Menu
      open={open}
      onOpenChange={setOpen}
      label="Labs"
      width={290}
      trigger={(props) => (
        <button className="lx-switch-btn" {...props}>
          <span className="lx-dot on" />
          <span className="lx-switch-name">{active?.name ?? "Lab"}</span>
          <span className={clsx("lx-switch-caret", open && "open")} aria-hidden="true">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3.5 5 6.5 8 3.5" />
            </svg>
          </span>
        </button>
      )}
    >
      <div className="lx-menu-list">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={clsx("lx-menu-item", s.id === activeId && "is-active")}
          >
            <button
              className="name"
              onClick={() => {
                onSwitch(s.id);
                setOpen(false);
              }}
              aria-current={s.id === activeId ? "true" : undefined}
            >
              <span className="t">{s.name}</span>
              <span className="id lx-mono">{s.id}</span>
            </button>
            {sessions.length > 1 && (
              <button
                className="lx-menu-del"
                onClick={() => onRemove(s.id)}
                title="Delete lab (and its memory)"
                aria-label={`Delete lab ${s.name} and its memory`}
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
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New lab name…"
          aria-label="New lab name"
        />
        <Button type="submit" variant="primary">
          + Add
        </Button>
      </form>
    </Menu>
  );
}
