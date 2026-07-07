"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import "./ui.css";

// Accessible dropdown shell: trigger gets aria-haspopup/aria-expanded, the
// panel closes on Escape and outside click. Content is free-form so callers
// like the session switcher can compose lists + forms inside.
export function Menu({
  open,
  onOpenChange,
  trigger,
  label,
  width = 290,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Render the trigger; spread `props` onto the button element. */
  trigger: (props: {
    onClick: () => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  }) => ReactNode;
  label?: string;
  width?: number;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onOpenChange]);

  return (
    <div className="ui-menu-wrap" ref={wrapRef}>
      {trigger({
        onClick: () => onOpenChange(!open),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": panelId,
      })}
      {open && (
        <div className="ui-menu" id={panelId} style={{ width }} role="menu" aria-label={label}>
          {label && (
            <div className="ui-menu-label" aria-hidden="true">
              {label}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
