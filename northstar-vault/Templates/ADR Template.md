---
type: adr
status: proposed
owner: "<% tp.system.prompt('Owner (name/role)') %>"
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
supersedes: []
superseded-by: []
tags: []
---

# <% tp.file.title %>

> [!info] Why this page exists
> This ADR records the reasoning behind a specific, significant decision — so it doesn't get re-debated later without the original context. See [[ADR Index]] for how the ADR system works overall.

> [!tip] When to use this page
> Read it before proposing a change that would contradict this decision. Update its `status` as the decision moves through its lifecycle (`proposed` → `accepted` → optionally `deprecated`/`superseded`) — never rewrite the `Decision` section after acceptance; write a new ADR instead.

> [!note] How it connects to the rest of the vault
> Link this ADR from any other note that depends on it (a spec, a system doc, a standard) — see [[Conventions]] for linking rules.

---

## Context

<!-- What situation made this decision necessary? What constraints applied? -->

## Decision

<!-- What was decided, stated plainly and specifically. -->

## Alternatives considered

<!-- What else was on the table, and why was it not chosen? -->

## Consequences

<!-- What becomes easier or harder as a result? What follow-up work does this create? -->
