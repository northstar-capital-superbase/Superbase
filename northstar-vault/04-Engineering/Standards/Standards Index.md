---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [engineering, standards]
---

# Standards

> [!info] Why this page exists
> Standards turn [[Values & Principles]] into concrete, checkable rules about how code gets written, reviewed, and shipped — so quality doesn't depend on who happens to review a given PR.

> [!tip] When to use this page
> Reference during code review when a PR violates (or clarifies a gap in) a standard. Propose a new standard when the same review comment has been made more than once or twice across different PRs — that's the signal it should be written down rather than repeated.

> [!note] How it connects to the rest of the vault
> Standards should be consistent with [[Values & Principles]] and can be motivated by a specific [[ADR Index|ADR]] (e.g. a decision about testing strategy becomes a standard about test coverage expectations).

---

## All standards

```dataview
TABLE status as "Status", updated as "Last reviewed"
FROM "04-Engineering/Standards"
WHERE type = "standard"
SORT file.name ASC
```

> [!todo] Placeholder
> Add the first standards docs as real conventions emerge — e.g. code review expectations, testing strategy, git workflow for app code (distinct from [[Git Integration]], which covers *this vault's* git workflow). Owner: Engineering Lead.
