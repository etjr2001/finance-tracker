# Sprint 2 Review

**Goal:** fix the rough edges found in sprint 1 and rework transaction add/edit.

## Shipped
- **Branch 1, quick fixes (#2)**:
  - Month calculation uses local time instead of UTC
  - Delete confirmations for Categories and Transactions
  - Delete buttons disabled while a delete is in flight
  - Stale edit error cleared in `CategoriesPage`
  - Date and month pickers open when you click anywhere on the bar
  - A "Draft" badge for $0 Transactions
- **Branch 2, transaction revamp (#3)**: add and edit moved into a modal, with a dirty-check in `TransactionForm`. Clicking outside closes silently when nothing has changed and asks for confirmation when something has. Add and edit behave the same way.
- **Category dropdown (#4)**: A–Z sort, and inline "create if not found" through a stacked modal, with case-insensitive reuse of existing Categories. The same PR fixed the mobile header and bugs in the exception handler.

## What went well
- ADR0007 took hold on the frontend. #3 and #4 landed with Vitest and RTL coverage for `Modal`, `ConfirmDialog`, `TransactionForm`, and both pages.
- Branches stayed short-lived, in line with ADR0006.

## What slipped
- #4 changed `GlobalExceptionHandler.java` without a backend test. This is the first miss against ADR0007, and the backend still has no test suite at all.

## Found while moving these docs into the repo
- Zero-amount Transactions had been allowed since sprint 1, contradicting the Sprint 1 review. This is now recorded in ADR0008.
- Category name uniqueness disagrees between the two sides. Inline create dedups ignoring case, but the backend constraint is case-sensitive.
- The Dashboard's Category breakdown still shows Categories that contain only Drafts, as `$0.00` rows.
- All three are tracked in `docs/backlog.md`.

## Carried into sprint 3
See `docs/backlog.md`.
