import clsx from "clsx";
import { AGENT_META } from "@/components/shared";

export interface ActivityItem {
  id: string;
  title: string;
  detail?: string;
  time: string;
  author?: string;
  kind?: string;
}

export function ActivityFeed({
  items,
  empty = "No recent activity.",
  className,
}: {
  items: ActivityItem[];
  empty?: string;
  className?: string;
}) {
  return (
    <div className={clsx("os-card flex flex-col", className)}>
      <div className="border-b border-white/5 px-4 py-3">
        <div className="text-sm font-semibold text-white">Activity</div>
      </div>
      <div className="max-h-80 flex-1 overflow-y-auto p-2">
        {items.length === 0 && (
          <p className="px-2 py-6 text-center text-[12px] text-slate-600">{empty}</p>
        )}
        {items.map((item) => {
          const color =
            item.author && item.author in AGENT_META
              ? AGENT_META[item.author as keyof typeof AGENT_META].color
              : "#64748b";
          return (
            <div
              key={item.id}
              className="rounded-lg px-2 py-2.5 transition hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-slate-200">
                  {item.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-slate-600">
                  {item.time}
                </span>
              </div>
              {item.detail && (
                <p className="mt-1 line-clamp-2 pl-3.5 text-[11px] text-slate-500">
                  {item.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
