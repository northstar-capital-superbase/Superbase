---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [product, specs]
---

# Specs

> [!info] Why this page exists
> A spec (PRD) is where "what are we building and why" gets written down *before* work starts, so engineering, design, and the founder are aligned before code is written instead of discovering misalignment mid-build.

> [!tip] When to use this page
> Create a new spec (from [[Spec (PRD) Template]]) before starting any non-trivial feature. Don't write a spec for a one-line bug fix or a change with one obvious implementation — that's process without benefit, which violates the "keep it simple" principle in [[Vault Guide]].

> [!note] How it connects to the rest of the vault
> A spec should link the [[Personas Index|persona]] it serves and the [[Mission & Vision|mission]] it supports. If it depends on a prior [[ADR Index|decision]], link that ADR rather than restating it. Once built, its outcome graduates to [[Features Index]] — see [[Product Index]] for that lifecycle.

---

## All specs by status

```dataview
TABLE status as "Status", owner as "Owner", updated as "Updated"
FROM "03-Product/Specs"
WHERE type = "spec"
SORT status ASC, updated DESC
```
