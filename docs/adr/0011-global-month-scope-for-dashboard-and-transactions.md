# 0011. Global month scope for the Dashboard and Transactions

## Status
Accepted — partly superseded by 0015 (month-to-month comparison)

## Context
Today the Dashboard is scoped to one month, picked with a native `<input type="month">`,
while the Transactions page shows a User's entire history in one unpaginated list
(`GET /api/transactions`). Sprint 3 planned both a date range picker (Bundle B) and
pagination (Bundle A).

Options considered:

1. **An arbitrary date range picker.** It needs two-date validation, a range-aware
   control that is awkward on mobile, and range-aware aggregation on the backend and in
   `demoApi.js`. That is a lot of effort for a personal tracker whose natural unit is the
   month.
2. **Month-only, with Transactions keeping an "all time" view** and the month as an
   optional filter. This keeps two modes for the same page, and the all-time list is
   exactly what makes pagination necessary.
3. **One global month, applied to both the Dashboard and Transactions.** This is the
   simplest model: both pages always answer "what happened in this month".

Seeing a User's whole history is still a real need. It is met by a planned CSV export
(`docs/backlog.md`) rather than by an all-time list view.

## Decision
The selected month is global and month-only. There are no date ranges.

- **Storage.** The month is held in the URL as `?month=YYYY-MM` and read and written
  through a `useSelectedMonth()` hook.
  - When the parameter is absent or invalid, it defaults to the current month, computed
    in local time via `lib/date.js` (never `toISOString()`).
  - Navigation links preserve the parameter, so switching pages keeps the month.
- **Which pages.** The Dashboard and Transactions show only the selected month. The
  Categories page is not month-scoped and does not show the control.
- **The control.**
  - A month bar with previous/next buttons and the month label centred between them.
    Tapping the label opens a month grid with a year switcher: a bottom sheet below
    `md:`, a popover at `md:` and up.
  - A "This month" reset appears only when the viewed month is not the current one.
  - The grid is our own component, not the native month input, whose support and
    styling are uneven across desktop browsers.
- **Behaviour.**
  - When a saved Transaction is dated outside the viewed month, the view switches to
    that Transaction's month, so the Transaction never silently disappears.
  - A month with no Transactions shows an empty state with an Add action, not a blank
    list.
  - Drafts (ADR0008) dated in other months are surfaced by a notice on the Transactions
    page (for example, "2 Drafts in other months") that links to them. Otherwise a Draft
    left unfinished last month would drop out of sight.
- **Where filtering happens.**
  - It starts client-side. Because `GET /api/transactions` is unpaginated today, the
    Transactions page filters the full list to the selected month in the browser. This
    keeps the feature frontend-only and demo-compatible, so it can ship within the
    frontend revamp.
  - Before, or in the same branch as, any pagination of `GET /api/transactions`, the
    month filter moves to the server, with `demoApi.js` mirroring it. Client-side
    filtering of a paginated list would be wrong.

## Consequences
- Month-to-month comparisons and multi-month totals are not available in the UI. The
  CSV export is the route to full history.
- The month is in the URL, so refresh, the back button, and bookmarks all keep it.
- Pagination becomes much less urgent, since one month's Transactions is a small list.
  It can be deferred; if built, "Load more" suits day-grouped lists better than numbered
  pages.
- Once filtering is server-side, the Drafts-in-other-months notice needs a count from
  the API rather than from the full list in memory.
- This supersedes the "date range picker" item in Sprint 3 Bundle B.
