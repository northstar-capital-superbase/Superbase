"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./mobile-console.css";

// Lightweight fixed bottom sheet with backdrop + drag handle.
// No external drawer primitive exists in the repo, so this is a small, self
// contained sheet used by the mobile lab console (SystemActivity / SharedMemory).
// - Escape or backdrop tap closes.
// - The grab handle can be dragged down to dismiss.
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset any residual drag offset whenever the sheet reopens.
  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientY - dragStart.current;
    if (delta > 0) setDragY(delta);
  };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    if (dragY > 110) onClose();
    else setDragY(0);
    dragStart.current = null;
  };

  return (
    <div className="msheet-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="msheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
      >
        <div
          className="msheet-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="button"
          tabIndex={0}
          aria-label="Drag down to close"
        >
          <span className="msheet-handle" aria-hidden="true" />
        </div>
        <div className="msheet-head">
          <div className="msheet-titles">
            <h2 className="msheet-title" id={titleId}>
              {title}
            </h2>
            {subtitle && <div className="msheet-sub">{subtitle}</div>}
          </div>
          <button className="msheet-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="msheet-body">{children}</div>
      </div>
    </div>
  );
}
