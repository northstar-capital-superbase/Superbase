---
type: adr
status: accepted
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
supersedes: []
superseded-by: []
tags: [process]
---

# ADR-0001: Record architecture decisions

> [!info] Why this page exists
> This is the seed ADR every ADR system starts with (a convention going back to Michael Nygard's original proposal) — it documents the decision to use ADRs at all, so the process is itself traceable. It's an example of the *format*, not a placeholder for Northstar-specific content.

> [!tip] When to use this page
> Point to it when explaining the ADR process to someone new, or as the literal template for structure (though [[ADR Template]] is the one to actually copy from for new decisions).

> [!note] How it connects to the rest of the vault
> It's `ADR-0001` in [[ADR Index]] — the first row. Every subsequent ADR follows the same four-section shape shown below.

---

## Context

Northstar needs a lightweight way to record the reasoning behind significant technical and product decisions — not just the outcome, but the alternatives considered and why they were rejected. Without this, decisions get re-debated, context is lost when people leave, and new team members can't tell which constraints are load-bearing versus incidental.

## Decision

Northstar will record architecture and product decisions as numbered Markdown files in [[ADR Index]], following the frontmatter and structure defined in [[ADR Template]]. Each ADR states the context, the decision, the alternatives considered, and the consequences. ADRs are immutable once `accepted`; changes of mind are recorded as new ADRs that supersede the old one.

## Alternatives considered

- **No formal record, decisions live in chat/meeting notes.** Rejected — decisions become unfindable and get re-argued.
- **A single running "decisions log" document.** Rejected — doesn't scale, hard to link to a specific decision, no clear status per item.
- **One ADR per decision, numbered and indexed (chosen).** Scales cleanly, each decision is independently linkable, and status per-ADR captures its lifecycle.

## Consequences

- Every future significant decision gets its own ADR file instead of living only in chat history or someone's memory.
- The team accepts a small amount of process overhead (writing the ADR) in exchange for not re-litigating settled decisions.
- [[ADR Index]] becomes the canonical place to check "has this already been decided?" before opening a new debate.
