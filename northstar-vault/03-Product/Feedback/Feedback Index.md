---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [product, feedback]
---

# Feedback

> [!info] Why this page exists
> Customer signal is easy to lose — it arrives in a call, a support ticket, a tweet — and gets forgotten unless it's captured somewhere durable. This folder is the intake point so recurring themes become visible instead of anecdotal.

> [!tip] When to use this page
> Log a note (from [[Feedback Note Template]]) whenever a customer/user says something worth remembering, good or bad. Don't over-engineer this into a full support ticketing system — that's a job for dedicated tooling once volume justifies it; this is for the signal worth carrying into product decisions.

> [!note] How it connects to the rest of the vault
> Feedback should get linked from the [[Specs Index|spec]] or [[Features Index|feature]] it's about, and can motivate a new [[User Research Index|research]] note if a theme recurs enough to investigate properly.

---

## Recent feedback

```dataview
TABLE owner as "Logged by", created as "Received"
FROM "03-Product/Feedback"
WHERE type = "feedback"
SORT created DESC
```
