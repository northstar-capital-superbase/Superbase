import clsx from "clsx";

export function MetricCard({
  label,
  value,
  sub,
  delta,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: { text: string; positive?: boolean };
  className?: string;
}) {
  return (
    <div className={clsx("os-card p-4", className)}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-medium tracking-tight text-white">
        {value}
      </div>
      {(sub || delta) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
          {sub && <span className="text-slate-500">{sub}</span>}
          {delta && (
            <span
              className={clsx(
                "font-medium",
                delta.positive === true && "text-emerald-400",
                delta.positive === false && "text-red-400",
                delta.positive === undefined && "text-slate-400",
              )}
            >
              {delta.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
