# 0014. Dashboard as separate Spending and Income cards, each with a bar/pie switch

## Status
Accepted — supersedes the category breakdown section of 0013

## Context
ADR0013 settled the Dashboard as one Net card followed by a single "Spending by category"
list: bars scaled against the largest Category, laid straight on the page background.
Sprint 3's Bundle B then planned to add Income by extending that list into three tabs
(Expense / Income / Overall). Overall would show net per Category (Income − Expense) as a
diverging bar, so that a refund reduces its Category's spend.

The user's sketch (2026-09-26) replaced the tabs with a different layout, and asked for a
switch between the existing bar list and a pie chart (previously an unscheduled backlog
item). Alternatives considered:

- **Tabs (the Bundle B plan).** Only one breakdown visible at a time, and Overall's net
  values can be negative, which a pie cannot draw. Rejected in favour of stacked cards.
- **Keeping Overall as a third card.** Rejected: with Spending and Income shown
  separately, a refund already appears under its Category in the Income card, and
  dropping Overall removes the only negative values the pie would have to handle.
- **A charting library for the pie.** ADR0010 rejected charting libraries. A CSS
  `conic-gradient` pie was considered but renders as one flat image with no per-slice
  interaction. Hand-built inline SVG gives per-slice shapes with no library.
- **Showing every Category in the bar list.** A month with nine Categories already fills a
  phone screen, which would push the Income card well below the fold.
- **Remembering the bar/pie choice** per device or per account. Rejected by the user in
  favour of a choice that lasts only while the Dashboard is open.

## Decision
The Dashboard is, top to bottom: the month bar, the Net card (unchanged from ADR0013), a
**Spending by category** card, and an **Income by category** card.

- **Both breakdowns are white cards**, each with its title and its own bar/pie switch in
  the header. The switch is the shared `SegmentedControl` (icon-only here), introduced by
  the Expense/Income toggle on the Transaction form.
- **Bar view is the default.** It keeps ADR0013's rows (icon tile, name, percentage,
  amount, Category-coloured bar), limited to the **top 5 Categories** by amount, with a
  "Show all N" control when there are more.
- **Pie view** is an inline SVG pie with the same top 5 plus one "Other" slice, and the
  same rows beneath it as the legend, without bars. Tapping a slice highlights its row.
  Categories with no colour yet use a neutral grey slice, as their bars do.
- **Each card's switch is independent** and held only in page state. It survives changing
  month while on the Dashboard and resets to bar on leaving the page. Nothing is stored.
- **A month with no Income** still shows the Income card, with a "No income this month"
  empty state, so the layout doesn't jump when stepping between months.
- **There is no Overall / net-per-Category view.**
- The Dashboard response carries two lists, spending by Category and income by Category.
  The planned `{ income, expense }` pair per Category existed only for Overall and is
  dropped. Drafts stay excluded (ADR0008). `demoApi.js` returns the same shape (ADR0009).

## Consequences
- Spending and Income are both visible without switching tabs, and the pie never has to
  deal with negative values.
- Net per Category is no longer shown anywhere. A User who wants "Groceries after
  refunds" works it out from the two cards.
- Only the top 5 show by default, so a small Category needs one tap to see.
- The pie is hand-built SVG: slice geometry, the "Other" grouping and tap handling are our
  code to test (ADR0007), not a library's.
- The bar/pie choice is lost on every navigation away, a deliberate trade for having no
  stored preference. Reversing it means adding storage, not reworking the cards.
- Scheduled for Sprint 4 together with ADR0015, since both change the Dashboard response.
