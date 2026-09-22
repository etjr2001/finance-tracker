# CONTEXT.md format

A glossary and nothing else: no implementation details, no class names, no endpoints, no libraries.

```markdown
# Context: <Project name>

Glossary of domain terms. No implementation details — see `docs/adr/` for those.

## <Term>
<One short paragraph: what it is, what it owns or belongs to, and the rules that define it (e.g. uniqueness, allowed values). Bold related sub-terms on first use. Reference other terms by their exact heading name.>
```

Rules:
- One `##` heading per term, using the exact canonical name. Headings are the vocabulary.
- State rules in domain language ("names are unique per User, ignoring case"), not in storage terms ("unique index on upper(name)").
- A term that's settled but not built yet stays, marked **Deferred to vN** with a reason.
- A term whose meaning comes from a decision may point to its ADR ("See ADR0008.").
- Order terms from the most central (User, Transaction) outward.
