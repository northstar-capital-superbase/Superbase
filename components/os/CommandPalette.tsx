"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OS_NAV } from "./nav";
import { NavIconSvg } from "./icons";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return OS_NAV;
    return OS_NAV.filter(
      (n) =>
        n.label.toLowerCase().includes(needle) ||
        n.description.toLowerCase().includes(needle),
    );
  }, [q]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQ("");
      router.push(href);
    },
    [router, onOpenChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-base-900/80 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="os-card w-full max-w-lg animate-fadeUp overflow-hidden shadow-glow"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
          <span className="font-mono text-[11px] text-slate-500">⌘K</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to…"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {items.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => go(item.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5"
              >
                <NavIconSvg icon={item.icon} className="text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-slate-200">{item.label}</span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-[12px] text-slate-600">
              No matches
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
