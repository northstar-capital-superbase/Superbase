"use client";

import { AGENT_META, estimateCostUSD, type CrewRun } from "@/components/shared";
import { useSettings } from "@/components/settings/useSettings";

// Shared agent-trace view used by both the desktop Chat and the mobile console.
// Respects Settings → Developer → "Show token usage".
export function AgentTrace({ run }: { run: CrewRun }) {
  const { settings } = useSettings();
  const showTokens = settings.developer.showTokens;

  const steps = [...run.specialistResults, run.synthesis];
  // Include the orchestrator plan-phase ms + tokens when the run carries them.
  const planTokens = run.planTokens ?? { input: 0, output: 0 };
  const totalMs = (run.planMs ?? 0) + steps.reduce((a, r) => a + r.ms, 0);
  const inTok =
    planTokens.input + steps.reduce((a, r) => a + (r.tokens?.input ?? 0), 0);
  const outTok =
    planTokens.output + steps.reduce((a, r) => a + (r.tokens?.output ?? 0), 0);
  const hasTokens = inTok + outTok > 0;
  const cost = estimateCostUSD(run.synthesis.model, inTok, outTok);
  // Orchestrator runs twice (plan + synthesis) plus each specialist.
  const agentCalls = run.specialistResults.length + 2;

  return (
    <div className="lx-trace">
      <div className="lx-trace-meta lx-mono">
        <span style={{ color: "var(--text-2)" }}>{run.synthesis.model}</span>
        <span>· {totalMs}ms total</span>
        {showTokens && hasTokens && (
          <span>
            · {inTok + outTok} tok ({inTok} in / {outTok} out)
          </span>
        )}
        <span>· {agentCalls} agent calls</span>
        {showTokens && cost !== null && cost > 0 && (
          <span style={{ color: "var(--text-2)" }}>· ~${cost.toFixed(4)}</span>
        )}
      </div>
      <TraceStep author="orchestrator" label="Plan" content={run.plan} />
      {run.specialistResults.map((r) => (
        <TraceStep
          key={r.agent}
          author={r.agent}
          label={`${AGENT_META[r.agent].label} · ${r.ms}ms${
            showTokens && r.tokens ? ` · ${r.tokens.input + r.tokens.output} tok` : ""
          }`}
          content={r.output}
        />
      ))}
    </div>
  );
}

function TraceStep({
  author,
  label,
  content,
}: {
  author: keyof typeof AGENT_META;
  label: string;
  content: string;
}) {
  const color = AGENT_META[author].color;
  return (
    <div className="lx-trace-step">
      <div className="lx-trace-step-h" style={{ color }}>
        <span className="lx-dot" style={{ backgroundColor: color }} />
        {label}
      </div>
      <p>{content}</p>
    </div>
  );
}
