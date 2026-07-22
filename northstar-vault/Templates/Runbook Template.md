---
type: runbook
status: active
owner: "<% tp.system.prompt('Owner (name/role)') %>"
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

# <% tp.file.title %>

> [!info] Why this page exists
> This is a tested, step-by-step procedure for a known operational situation, written so it can be followed correctly under stress, by someone who may not be the original author. See [[Runbooks Index]].

> [!tip] When to use this page
> Follow it when its trigger condition (below) occurs. Update it immediately after any incident where a step was wrong, missing, or unclear — while it's fresh.

> [!note] How it connects to the rest of the vault
> Link the [[Systems Index|system]] this applies to. If following this runbook reveals a deeper design flaw, open an [[ADR Index|ADR]] or [[Specs Index|spec]] for a real fix rather than treating the workaround as permanent.

---

## Trigger condition

> [!todo] Placeholder
> How do you know this runbook applies? (alert name, symptom, etc.)

## Steps

> [!todo] Placeholder
> Numbered, specific, copy-pasteable where possible.

## Verification

> [!todo] Placeholder
> How do you confirm the issue is actually resolved?

## Escalation

> [!todo] Placeholder
> Who/what to escalate to if these steps don't resolve it.
