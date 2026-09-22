# Commit Message Format

## Subject line
`<type>: <short summary>`, same `type` prefixes already in use in history: `feat`, `fix`, `docs`. Keep it a single line, plain description of the change — no issue/PR number (GitHub appends that automatically on merge).

## Body
A bullet list of what changed, not a prose paragraph explaining why. Each bullet is one concrete, factual change — no rationale, no "this fixes X because Y." If the reasoning matters, it belongs in the PR description or a backlog/ADR entry, not the commit body.

Good (from #3):
```
feat: move transaction add/edit into a modal, add dirty-check and confirm dialogs

- Convert TransactionForm's inline Add/Edit panel into a Modal
- Add dirty-tracking to TransactionForm (onDirtyChange), compared
  against its initial snapshot
- Outside-click/Escape closes silently if untouched, confirms via
  ConfirmDialog if dirty — same behavior for Add and Edit
- Replace window.confirm() with ConfirmDialog for delete confirmation
  on both TransactionsPage and CategoriesPage
- Add Vitest + RTL coverage per ADR0007 (Modal, ConfirmDialog,
  TransactionForm dirty-tracking, TransactionsPage/CategoriesPage
  integration tests)
```

Avoid (narrative paragraph explaining motivation):
```
fix: stop leaking raw DB errors, add logging to GlobalExceptionHandler

handleDataIntegrityViolation returned the raw Postgres/Hibernate
exception message straight to the client (e.g. constraint names); it
now returns a generic message and logs the real exception. Every
handler now logs...
```

## Trailer
Keep the `Co-Authored-By:` trailer as-is when Claude Code generates the commit.
