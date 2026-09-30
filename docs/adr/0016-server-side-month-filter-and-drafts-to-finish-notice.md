# 0016. Server-side month filter and a "Drafts to finish" notice

## Status
Accepted. Amends 0011: replaces its client-side filtering stopgap and its "Drafts in other months" notice.

## Context
ADR0011 scoped the Transactions page to one global month, filtered in the browser at first, and planned a notice for Drafts (ADR0008) dated in other months. Two things changed:

- Pagination was dropped (`docs/backlog.md`), and ADR0011 said the month filter moves to the server before or with any pagination. It is moved anyway: fetching a User's whole history just to show one month gets slower as history grows, and the Dashboard already filters server-side.
- The "Drafts in other months" notice was never built. With the filter on the server, the browser no longer holds other months' Drafts, so the notice needs its own data. A notice that only counts other months would also hide a Draft in the viewed month from the count, which is confusing.

## Decision
- **The month filter is server-side.** `GET /api/transactions?month=YYYY-MM` returns that month's Transactions, newest first. An absent or blank `month` means the current month (same rule as the Dashboard); a malformed one is a 400. `demoApi.js` mirrors it (ADR0009). Each month is its own React Query cache entry, and the previous month stays on screen while the next loads.
- **Drafts have their own endpoint.** `GET /api/transactions/drafts` returns every Draft across all months, oldest first. It is a full list, not a count plus a list: Drafts are rare, and the notice and the sheet share one response.
- **The notice reads "N Drafts to finish"** and shows whenever any Draft exists, including in the viewed month. Tapping it opens a sheet of every Draft, grouped by month (oldest month first, oldest date first within each). Tapping a Draft closes the sheet and opens its edit form.

## Consequences
- `GET /api/transactions` with no `month` no longer returns the full history. Anything wanting it needs the planned CSV export (`docs/backlog.md`).
- Saving or deleting a Transaction invalidates every month's cache entry and the Drafts list, since they share the `['transactions', isDemo]` key prefix.
- Finishing a Draft dated in another month switches the view to that month, per ADR0011's existing behaviour for saves outside the viewed month.
- The Drafts list is unbounded. If a User ever accumulates a very large number, this needs revisiting.
