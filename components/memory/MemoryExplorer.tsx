"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { AGENT_META, type MemoryEntry } from "@/components/shared";
import { Button, Input, Modal, Spinner } from "@/components/ui";
import "./memory-explorer.css";

const KINDS = ["all", "message", "plan", "agent_output", "fact"] as const;
const AUTHORS = [
  "all",
  "user",
  "orchestrator",
  "research",
  "strategist",
  "behavioral",
] as const;

// Full-screen deep-dive into the shared lab_memory store: filter by kind and
// author, full-text search, and expand any entry to read its full content.
export function MemoryExplorer({
  sessionId,
  open,
  onClose,
}: {
  sessionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [author, setAuthor] = useState<(typeof AUTHORS)[number]>("all");
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ sessionId, limit: "300" });
    if (kind !== "all") params.set("kind", kind);
    if (author !== "all") params.set("author", author);
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/memory?${params}`);
      if (!res.ok) {
        setError(`Memory store returned ${res.status} — try again.`);
        return;
      }
      setEntries((await res.json()).entries ?? []);
    } catch {
      setError("Couldn't reach the memory store — check the dev server and retry.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, kind, author, q]);

  // Debounced reload whenever the modal is open or filters change.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [open, load]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Memory Explorer"
      subtitle={
        <>
          {loading ? "querying lab memory…" : `${entries.length} entries`} · lab{" "}
          <span style={{ fontFamily: "var(--os-mono)" }}>{sessionId}</span>
        </>
      }
      actions={
        <Button size="sm" onClick={onClose} aria-label="Close memory explorer">
          Close ✕
        </Button>
      }
    >
      {/* Controls */}
      <div className="mx-controls">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search memory content…"
          aria-label="Search memory content"
        />
        <div className="mx-chip-row" role="group" aria-label="Filter by kind">
          {KINDS.map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              {k}
            </Chip>
          ))}
        </div>
        <div className="mx-chip-row" role="group" aria-label="Filter by author">
          {AUTHORS.map((a) => {
            const color = AGENT_META[a as keyof typeof AGENT_META]?.color;
            return (
              <Chip key={a} active={author === a} onClick={() => setAuthor(a)} color={color}>
                {a}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="mx-results">
        {loading && entries.length === 0 && (
          <div className="mx-state" role="status">
            <Spinner size={14} /> Querying lab memory…
          </div>
        )}
        {error && (
          <div className="mx-state mx-state--error" role="alert">
            {error}
            <Button size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="mx-state">
            No matching memory entries — adjust the filters or run the crew to
            generate some.
          </div>
        )}
        {entries.map((e) => {
          const meta = AGENT_META[e.author as keyof typeof AGENT_META];
          const color = meta?.color ?? "#64748b";
          const isOpen = expanded === e.id;
          return (
            <div key={e.id} className="mx-entry">
              <button
                className="mx-entry-head"
                onClick={() => setExpanded(isOpen ? null : e.id)}
                aria-expanded={isOpen}
              >
                <span className="mx-entry-dot" style={{ backgroundColor: color }} />
                <span className="mx-entry-author" style={{ color }}>
                  {meta?.label ?? e.author}
                </span>
                <span className="mx-entry-kind">{e.kind}</span>
                <span className="mx-entry-time">
                  {new Date(e.createdAt).toLocaleTimeString()}
                </span>
              </button>
              <p className={clsx("mx-entry-body", !isOpen && "mx-entry-body--clamped")}>
                {e.content}
              </p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx("mx-chip", active && "mx-chip--active")}
      aria-pressed={active}
    >
      {color && (
        <span className="mx-chip-dot" style={{ backgroundColor: color }} />
      )}
      {children}
    </button>
  );
}
