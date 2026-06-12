import clsx from "clsx";

export type BadgeTone = "ok" | "warn" | "idle" | "live" | "error";

const toneClass: Record<BadgeTone, string> = {
  ok: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  warn: "bg-amber-500/10 text-amber-200 ring-amber-500/20",
  idle: "bg-white/5 text-slate-400 ring-white/10",
  live: "bg-accent/10 text-accent-soft ring-accent/25",
  error: "bg-red-500/10 text-red-300 ring-red-500/20",
};

export function StatusBadge({
  children,
  tone = "idle",
  dot = true,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            tone === "ok" && "bg-emerald-400",
            tone === "warn" && "bg-amber-400",
            tone === "live" && "bg-accent animate-pulseSoft",
            tone === "error" && "bg-red-400",
            tone === "idle" && "bg-slate-500",
          )}
        />
      )}
      {children}
    </span>
  );
}
