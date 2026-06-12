import clsx from "clsx";
import type { AgentProfile } from "@/components/shared";
import { StatusBadge, type BadgeTone } from "./StatusBadge";

export type AgentCardStatus = "idle" | "thinking" | "done" | "offline";

function statusTone(s: AgentCardStatus): BadgeTone {
  if (s === "thinking") return "live";
  if (s === "done") return "ok";
  if (s === "offline") return "idle";
  return "idle";
}

export function AgentCard({
  agent,
  status = "idle",
  meta,
  onClick,
  compact,
}: {
  agent: AgentProfile;
  status?: AgentCardStatus;
  meta?: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "os-card group relative overflow-hidden text-left transition duration-200",
        compact ? "p-3" : "p-4",
        onClick && "hover:border-accent/30 hover:bg-base-750/80",
        status === "thinking" && "ring-1 ring-inset",
      )}
      style={
        status === "thinking"
          ? ({ ["--tw-ring-color" as string]: agent.color } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{ backgroundColor: agent.color }}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold"
          style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
        >
          {agent.name[0]}
        </span>
        <StatusBadge tone={statusTone(status)}>
          {status === "thinking" ? "active" : status}
        </StatusBadge>
      </div>
      <div className={clsx("font-semibold text-white", compact ? "mt-2 text-sm" : "mt-3")}>
        {agent.name}
      </div>
      <div className="text-[11px] text-slate-500">{agent.role}</div>
      {!compact && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
          {agent.description}
        </p>
      )}
      {meta && (
        <div className="mt-2 font-mono text-[10px] text-slate-600">{meta}</div>
      )}
    </Wrapper>
  );
}
