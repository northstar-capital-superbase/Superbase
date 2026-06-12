"use client";

import type { TimelineEvent } from "./labsIntel";

export function ExecutionTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="ops-panel ops-timeline">
      <div className="ops-panel-head">
        <h2 className="ops-panel-title">Execution timeline</h2>
        <span className="ops-panel-meta">{events.length} events</span>
      </div>

      <ol className="ops-timeline-list">
        {events.length === 0 ? (
          <li className="ops-timeline-empty">
            <span className="ops-timeline-empty-title">No executions yet</span>
            <span className="ops-timeline-empty-body">
              Issue a directive below. Workflow steps and agent outputs will
              stream here in real time.
            </span>
          </li>
        ) : (
          events.map((ev) => (
            <li key={ev.id} className={`ops-timeline-item tone-${ev.tone}`}>
              <div className="ops-timeline-rail">
                <span
                  className="ops-timeline-node"
                  style={
                    ev.color ? { borderColor: ev.color, color: ev.color } : undefined
                  }
                />
              </div>
              <div className="ops-timeline-body">
                <div className="ops-timeline-meta">
                  <span className="ops-timeline-label">{ev.label}</span>
                  <time className="ops-timeline-time">{ev.time}</time>
                </div>
                <p className="ops-timeline-detail">{ev.detail}</p>
              </div>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
