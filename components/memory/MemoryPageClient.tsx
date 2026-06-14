"use client";

import { useCallback, useState } from "react";
import { MemoryExplorer } from "./MemoryExplorer";
import { AGENT_META, type MemoryEntry } from "@/components/shared";
import { useSessions } from "@/components/session/useSessions";
import { useEffect } from "react";
import clsx from "clsx";

const KIND_COLORS: Record<string, string> = {
  message: "#6d8bff",
  agent_output: "#34d399",
  fact: "#fbbf24",
  plan: "#a78bfa",
};

export function MemoryPageClient() {
  const { sessions, activeId, setActive } = useSessions();
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadMemory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/memory?sessionId=${activeId}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    void loadMemory();
  }, [loadMemory]);

  const clearMemory = useCallback(async () => {
    await fetch(`/api/memory?sessionId=${activeId}`, { method: "DELETE" });
    setEntries([]);
  }, [activeId]);

  const exportMemory = useCallback(async () => {
    const res = await fetch(`/api/memory?sessionId=${activeId}&limit=500`);
    if (!res.ok) return;
    const data = await res.json();
    const entries: MemoryEntry[] = data.entries ?? [];
    const name = sessions.find((s) => s.id === activeId)?.name ?? activeId;
    const header = `# Northstar Memory — ${name}\n\n_Lab \`${activeId}\` · exported ${new Date().toLocaleString()}_\n`;
    const body = entries
      .map(
        (e) =>
          `\n## ${e.author} · ${e.kind} · ${new Date(e.createdAt).toLocaleString()}\n\n${e.content}`,
      )
      .join("\n");
    const blob = new Blob([header + body + "\n"], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-${name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeId, sessions]);

  const kindCounts = entries.reduce(
    (acc, e) => {
      acc[e.kind] = (acc[e.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const authorCounts = entries.reduce(
    (acc, e) => {
      acc[e.author] = (acc[e.author] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="label-mono mb-2">Institutional Context</div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-heading-xl font-semibold tracking-tight text-slate-100">
              Memory
            </h1>
            <p className="mt-1 text-body-md text-slate-500">
              Every insight, plan, and decision agents have produced — searchable and persistent.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setExplorerOpen(true)} className="btn btn-secondary btn-sm">
              Search
            </button>
            <button onClick={exportMemory} className="btn btn-secondary btn-sm">
              Export
            </button>
            <button onClick={clearMemory} className="btn btn-danger btn-sm">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="panel p-4">
          <div className="label-mono mb-1">Total Entries</div>
          <div className="tabular-nums text-2xl font-semibold text-slate-100">{entries.length}</div>
        </div>
        {Object.entries(kindCounts).map(([kind, count]) => (
          <div key={kind} className="panel p-4">
            <div className="label-mono mb-1">{kind.replace("_", " ")}</div>
            <div
              className="tabular-nums text-2xl font-semibold"
              style={{ color: KIND_COLORS[kind] ?? "#8892b0" }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>

      {/* Session selector */}
      {sessions.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="label-mono">Lab:</span>
          <div className="flex gap-1.5">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                  activeId === s.id
                    ? "bg-accent/10 text-accent"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent contribution summary */}
      {Object.keys(authorCounts).length > 0 && (
        <div className="panel mb-4 p-4">
          <div className="label-mono mb-3">Agent Contributions</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(authorCounts).map(([author, count]) => {
              const meta = AGENT_META[author as keyof typeof AGENT_META];
              const color = meta?.color ?? "#64748b";
              return (
                <div key={author} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[12px] text-slate-400">{meta?.label ?? author}</span>
                  <span className="font-mono text-[12px] text-slate-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Memory entries */}
      <div className="space-y-2">
        {loading && (
          <div className="py-10 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-700">
              Loading…
            </span>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.06] px-6 py-12 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-700">
              No memory entries
            </div>
            <div className="mt-2 text-[12px] text-slate-700">
              Run a crew from{" "}
              <a href="/labs" className="text-accent hover:underline">
                Labs
              </a>{" "}
              and agent insights will appear here.
            </div>
          </div>
        )}

        {!loading &&
          [...entries].reverse().map((entry) => {
            const meta = AGENT_META[entry.author as keyof typeof AGENT_META];
            const color = meta?.color ?? "#64748b";
            const kindColor = KIND_COLORS[entry.kind] ?? "#5a6080";
            return (
              <div
                key={entry.id}
                className="panel-tight animate-fadeUp px-4 py-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-medium" style={{ color }}>
                    {meta?.label ?? entry.author}
                  </span>
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: kindColor, backgroundColor: `${kindColor}12` }}
                  >
                    {entry.kind.replace("_", " ")}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-slate-700">
                    {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-400">
                  {entry.content}
                </p>
              </div>
            );
          })}
      </div>

      <MemoryExplorer
        sessionId={activeId}
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
      />
    </div>
  );
}
