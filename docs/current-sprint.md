# Current sprint

The sprint in progress and the next one planned, moved unchanged from `docs/backlog.md` on 2026-11-22. "What's next" always comes from here (CLAUDE.md). Finished sprints are in `docs/sprints/sprint-history.md`; bugs, ideas and tech debt in `docs/backlog.md`.

A feature in progress keeps its plan at `docs/plans/<feature>.md`, on its own branch only. It is removed from history before that branch is pushed, so it never reaches `main`.

### Recurring sprint: in progress (2026-11-15 → 2026-12-13)
Planned 2026-11-15, the first sprint planned with a fixed timebox. The timebox is 4 weeks because capacity is under 5 h/week: ~15.5 h of work against ~16 h. Scope is fixed (CLAUDE.md working rules). New bugs and ideas go to `docs/backlog.md`, not into this sprint.

**Sprint Goal:** a User can set up a Recurring item, see it post its Transactions on schedule, and see how much of this month their recurring bills have already spoken for.

**Sprint Backlog**, in priority order, one short-lived branch each (ADR0006):

| # | Branch | Item | Who | Est. |
|---|---|---|---|---|
| 1 | `feat/clone-transaction` | Clone action: pick a Transaction and get a prefilled Add form (Backlog "Duplicate transaction"). Demo mirrors it. | Agent | 1.5 h |
| 2 | `chore/transactions-created-at` | `V7`: nullable `created_at` on `transactions` (Tech debt). Comes before Recurring so the migration numbers stay in order. | PO writes the SQL | 0.5 h |
| 3 | `docs/adr-0018-recurring` | ADR0018, the `CONTEXT.md` Recurring entry, and its `docs/adr/README.md` row. | Agent drafts, PO reviews | 1 h |
| 4 | `feat/recurring-backend` | `V8` table. Entity, repository, schedule logic (month-end clamp from the original anchors). CRUD `/api/recurring` and the Category delete guard. One locked posting path (`FOR UPDATE SKIP LOCKED`) used by the scheduled job, the startup catch-up (cap 366) and saving an item. Nothing in the UI calls it until #5, so it's safe to deploy. | PO writes the code; agent writes the tests first, specs each step, reviews | 6 h |
| 5 | `feat/recurring-page` | Recurring page (fifth nav item). Demo mirror through a shared JS schedule util, tested on the same cases as the Java tests. "Make recurring" on a Transaction. "Left to avoid spending: $X + N unknown". | Agent | 5.5 h |
| 6 | `fix/demo-exit-sidebar` | "Exit demo" starts off screen in the desktop sidebar in demo mode (Tech debt). Lowest priority, dropped first if time runs out. | Agent | 1 h |

**Pulled in mid-sprint (PO exception, 2026-11-22):** `docs/claude-context-cleanup` (this file's split from the backlog) and `fix/review-top-findings` (review findings CORE-H1, TEST-H1, TEST-H2, API-M1). Not part of the Sprint Goal. If time runs short, item 6 is still the first to drop.

**Definition of Done** (each item):
- Tests land in the same branch (ADR0007), and backend tests need no live Supabase connection.
- Lint passes.
- `/demo` returns the same response shapes (ADR0009).
- Layout is checked at mobile width as well as desktop.
- The item's backlog entry is updated, and the PR is merged.

**Sprint Review and Retrospective:** 2026-12-13, written to `docs/sprints/recurring-review.md`, then the next sprint is planned.

### Sprint 4: planned
One bundle, **the Dashboard rework**, since everything in it changes the Dashboard response and `demoApi.js`'s copy of it, which should happen once. Reuses Sprint 3's `SegmentedControl`.

- **Two-card Dashboard with bar/pie switches (ADR0014).** Net card unchanged (ADR0013). Below it, a Spending by category card and an Income by category card, each with its own bar/pie switch in the header: bar by default, top 5 plus "Show all N"; pie in inline SVG with top 5 plus "Other" and the same rows as its legend. Each switch holds its choice while on the Dashboard (including across month changes) and resets on leaving. Income card shows "No income this month" when empty. Replaces the old Bundle B tabs plan: the Overall / net-per-Category view is dropped, so the response carries two per-Category lists (spending, income) instead of an `{ income, expense }` pair per Category.
- **Compare with the previous month (ADR0015).** The Net card's Income, Expenses and Net each show their change against the whole of the month before the viewed one (whole month against whole month, even for the current month), in `ink-soft`, always shown, no switch. The response adds the previous month's totals.
- **Both category breakdowns get rebuilt, not just extended.** Today only Expenses are broken down: `DashboardService.buildCategoryBreakdown` and `demoApi.js`'s `buildCategoryBreakdown` both skip Income. Sprint 4 replaces each with two per-Category lists (spending and income), so update both together, and the comment above the demo function.

Follows ADR0007: tests land with the bundle.
