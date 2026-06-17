import clsx from "clsx";

export interface TimelineEvent {
  id: string;
  label: string;
  detail?: string;
  time: string;
  accent?: string;
}

export function Timeline({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  return (
    <div className={clsx("os-card p-4", className)}>
      <div className="mb-4 text-sm font-semibold text-white">Timeline</div>
      <ol className="relative space-y-0 border-l border-white/10 pl-4">
        {events.map((ev) => (
          <li key={ev.id} className="relative pb-5 last:pb-0">
            <span
              className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-base-900"
              style={{ backgroundColor: ev.accent ?? "#6d8bff" }}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-slate-200">{ev.label}</span>
              <span className="font-mono text-[10px] text-slate-600">{ev.time}</span>
            </div>
            {ev.detail && (
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{ev.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
