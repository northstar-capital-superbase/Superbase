"use client";

import { AGENT_META, type MemoryEntry } from "@/components/shared";

// Right rail: a live tail of the shared memory the agents read and write.
export function MemoryPanel({
  entries,
  onClear,
  onExplore,
  onExport,
  onForget,
}: {
  entries: MemoryEntry[];
  onClear: () => void;
  onExplore: () => void;
  onExport: () => void;
  onForget: (id: string) => void;
}) {
  return (
    <div className="panel flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-white">Shared Memory</div>
          <div className="text-[11px] text-slate-500">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExplore}
            className="rounded-md border border-white/5 px-2 py-1 text-[11px] text-slate-400 transition hover:border-accent/40 hover:text-slate-200"
          >
            Explore
          </button>
          <button
            onClick={onExport}
            title="Download this lab's memory as Markdown"
            className="rounded-md border border-white/5 px-2 py-1 text-[11px] text-slate-400 transition hover:border-accent/40 hover:text-slate-200"
          >
            Export
          </button>
          <button
            onClick={onClear}
            className="rounded-md border border-white/5 px-2 py-1 text-[11px] text-slate-400 transition hover:border-white/10 hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {entries.length === 0 && (
          <div className="px-1 pt-4 text-[12px] text-slate-600">
            Empty. Run the crew and every agent contribution lands here.
          </div>
        )}
        {entries.map((e) => {
          const meta = AGENT_META[e.author as keyof typeof AGENT_META];
          const color = meta?.color ?? "#64748b";
          return (
            <div key={e.id} className="group panel-tight animate-fadeUp p-2.5">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] font-medium" style={{ color }}>
                  {meta?.label ?? e.author}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-600">
                  {e.kind}
                </span>
                <button
                  onClick={() => onForget(e.id)}
                  title="Forget this entry"
                  aria-label="Forget this entry"
                  className="text-[11px] leading-none text-slate-600 opacity-0 transition hover:text-red-300 focus:opacity-100 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400">
                {e.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
