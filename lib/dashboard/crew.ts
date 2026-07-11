// Pure crew-status helpers. On the Command Center the roster is honest by
// construction: statuses are only ever "thinking"/"done" during a live Lab
// Console run (see useLabConsole), so on the home every agent is "idle" and
// these labels stay truthful ("No recent activity") rather than inventing a
// specific timestamp or task description that doesn't exist.
export type AgentStatus = "idle" | "thinking" | "done";

export function lastActivityLabel(status: AgentStatus): string {
  switch (status) {
    case "thinking":
      return "In progress";
    case "done":
      return "Just completed a task";
    default:
      return "No recent activity";
  }
}

export function currentTaskLabel(status: AgentStatus): string {
  switch (status) {
    case "thinking":
      return "Working on the current run";
    default:
      return "No active task";
  }
}
