"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { toMemoryRows } from "./mobileData";
import type { MemoryEntry } from "@/components/shared";
import "./mobile-console.css";

export function SharedMemorySheet({
  open,
  onClose,
  memory,
}: {
  open: boolean;
  onClose: () => void;
  memory: MemoryEntry[];
}) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => toMemoryRows(memory), [memory]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.title.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Shared Memory"
      subtitle={`${rows.length} ${rows.length === 1 ? "memory" : "memories"} in context`}
    >
      <div className="msearch">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memory…"
          aria-label="Search shared memory"
        />
      </div>

      <div className="mrows">
        {filtered.length === 0 ? (
          <p className="mrows-empty">No memory matches “{query}”.</p>
        ) : (
          filtered.map((r) => (
            <div className="mrow" key={r.id}>
              <span className="mrow-swatch" style={{ backgroundColor: r.accent }} aria-hidden="true" />
              <span className="mrow-main">
                <span className="mrow-title">{r.title}</span>
                <span className="mrow-detail mrow-detail--clamp">{r.detail}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </BottomSheet>
  );
}
