"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { PageHeader } from "@/components/os/PageHeader";
import { AGENT_META, type MemoryEntry } from "@/components/shared";
import { useSessions } from "@/components/session/useSessions";

const KINDS = ["all", "message", "plan", "agent_output", "fact"] as const;
const AUTHORS = [
  "all",
  "user",
  "orchestrator",
  "research",
  "strategist",
  "behavioral",
  "trader",
] as const;

export function MemoryWorkspace() {
  const { activeId } = useSessions();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [author, setAuthor] = useState<(typeof AUTHORS)[number]>("all");
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<"timeline" | "list">("timeline");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sessionId: activeId, limit: "300" });
    if (kind !== "all") params.set("kind", kind);
    if (author !== "all") params.set("author", author);
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/memory?${params}`);
      if (res.ok) setEntries((await res.json()).entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [activeId, kind, author, q]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Memory"
        title="Knowledge Graph"
        description="Search, filter, and explore shared agent memory across your active lab."
      />

      <div className="flex flex-wrap gap-2">
        {(["timeline", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-[12px] capitalize",
              view === v
                ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                : "border border-white/5 text-slate-500",
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="os-card space-y-3 p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search memory…"
          className="w-full rounded-lg border border-white/5 bg-base-750/60 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
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

      <div className="font-mono text-[11px] text-slate-600">
        session {activeId.slice(0, 8)}… · {loading ? "loading…" : `${entries.length} entries`}
      </div>

      <div
        className={clsx(
          view === "list" ? "space-y-2" : "relative border-l border-white/10 pl-4 space-y-4",
        )}
      >
        {!loading && entries.length === 0 && (
          <p className="py-12 text-center text-[13px] text-slate-600">
            No memory yet — run a crew in Labs.
          </p>
        )}
        {entries.map((e) => {
          const meta = AGENT_META[e.author as keyof typeof AGENT_META];
          const color = meta?.color ?? "#64748b";
          const isOpen = expanded === e.id;
          return (
            <div
              key={e.id}
              className={clsx(
                view === "timeline" && "relative pb-2",
                "os-card p-3",
              )}
            >
              {view === "timeline" && (
                <span
                  className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full border-2 border-base-900"
                  style={{ backgroundColor: color }}
                />
              )}
              <button
                type="button"
                className="flex w-full items-center gap-2 text-left"
                onClick={() => setExpanded(isOpen ? null : e.id)}
              >
                <span className="text-[11px] font-medium" style={{ color }}>
                  {meta?.label ?? e.author}
                </span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                  {e.kind}
                </span>
                <span className="ml-auto font-mono text-[10px] text-slate-600">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </button>
              <p
                className={clsx(
                  "mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-400",
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
      type="button"
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
