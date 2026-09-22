# ADR format

File: `docs/adr/NNNN-kebab-case-title.md`. Numbers are sequential and never reused.

```markdown
# NNNN. <Title as a decision, e.g. "Use Supabase Auth instead of self-issued JWT">

## Status
Accepted | Accepted — supersedes NNNN | Superseded by NNNN

## Context
<The forces at play: what problem, what constraints, what earlier ADRs this builds on or reverses. Name the alternatives that were genuinely considered.>

## Decision
<What was decided, stated plainly. Enough specifics to act on.>

## Consequences
- <Good and bad results, both. What becomes easier, what becomes harder, what it would cost to reverse, what's now tracked elsewhere (e.g. the backlog).>
```

Rules:
- ADRs are historical records. Never rewrite an old ADR's body; supersede it with a new one and change only its Status line.
- Reference other ADRs as `ADR0004` in prose.
- Update `docs/adr/README.md` in the same change (see SKILL.md).
