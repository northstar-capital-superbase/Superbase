"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import "./ui.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Accessible modal: Escape to close, click-outside to close, focus trap,
// focus restore on close. Backdrop blur is allowed here (floating surface).
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  actions,
  children,
  maxWidth = 760,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    // Move focus into the dialog.
    const firstNode = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstNode?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="ui-modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-head">
          <div>
            <h2 className="ui-modal-title" id={titleId}>
              {title}
            </h2>
            {subtitle && <div className="ui-modal-sub">{subtitle}</div>}
          </div>
          {actions}
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}
