"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { AGENT_META, type MemoryEntry } from "@/components/shared";

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
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sessionId, limit: "300" });
    if (kind !== "all") params.set("kind", kind);
    if (author !== "all") params.set("author", author);
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/memory?${params}`);
      if (res.ok) setEntries((await res.json()).entries ?? []);
    } catch {
      /* surfaced as empty */
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

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel flex h-[80vh] w-full max-w-3xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-white">Memory Explorer</div>
            <div className="text-[11px] text-slate-500">
              {loading ? "loading…" : `${entries.length} entries`} · session{" "}
              <span className="font-mono truncate" title={sessionId}>
                {sessionId.slice(0, 12)}…
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-white/5 px-2 py-1 text-[12px] text-slate-400 transition hover:text-slate-200"
          >
            Close ✕
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-2 border-b border-white/5 px-4 py-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search content…"
            className="w-full rounded-lg border border-white/5 bg-base-750/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
                {k}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
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
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {!loading && entries.length === 0 && (
            <div className="px-1 pt-6 text-center text-[12px] text-slate-600">
              No matching memory entries.
            </div>
          )}
          {entries.map((e) => {
            const meta = AGENT_META[e.author as keyof typeof AGENT_META];
            const color = meta?.color ?? "#64748b";
            const isOpen = expanded === e.id;
            return (
              <div key={e.id} className="panel-tight p-2.5">
                <button
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-medium" style={{ color }}>
                    {meta?.label ?? e.author}
                  </span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {e.kind}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-600">
                    {new Date(e.createdAt).toLocaleTimeString()}
                  </span>
                </button>
                <p
                  className={clsx(
                    "mt-1.5 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-400",
                    !isOpen && "line-clamp-3",
                  )}
                >
                  {e.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
      className={clsx(
        "rounded-full border px-2.5 py-1 text-[11px] capitalize transition",
        active
          ? "border-accent/50 bg-accent/15 text-slate-100"
          : "border-white/5 text-slate-400 hover:text-slate-200",
      )}
    >
      {color && (
        <span
          className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}
