# 0013. Dashboard summary as a single Net card, not three equal tiles

## Status
Accepted — category breakdown section superseded by 0014

## Context
ADR0010's Decision section describes the Dashboard only loosely — "summary cards" and
"a ranked list with horizontal bars" — without specifying their layout. The
implementation that followed (`style/design-tokens` onward) read this as three
equal-weight stat tiles side by side (Income | Expenses | Net), each the same size and
visual weight.

Partway through the revamp, the user shared mockups (2026-09-24) showing a different,
more specific layout: Net as a single hero figure, with Income and Expenses demoted to
supporting detail beneath it, and colour used to summarise their proportion at a glance.
This was recorded as a working note (project memory, and `docs/backlog.md`'s
`style/dashboard-page` entry) to build correctly when that branch was reached, and to
formalise here afterward rather than leave the actual layout undocumented.

Two things this settles, considered against the alternative (the three-tile grid already
built):
- **Which figure is the headline.** A finance tracker's Dashboard exists to answer "how
  am I doing this month" in one glance — that's Net, not Income or Expenses
  individually. Three equal tiles give all three the same visual weight, burying the one
  that answers the actual question.
- **Colour on the individual amounts.** ADR0010 puts individual expense amounts in
  `ink`, specifically to stop the Transactions *list* reading as a wall of red when
  scanning many rows (its Context section). A single Net figure has no such list to
  scan, so that reasoning doesn't transfer — colour-coding it (green if non-negative,
  red if negative) instead follows the Dashboard's own existing precedent for Net,
  and `TransactionDetail`'s single hero amount (`feat/mobile-transaction-row`), which
  reasoned the same way for the same kind of one-off figure.

## Decision
The Dashboard's summary is one white `Card`, not a three-tile grid:
- **Net this month**, as a large serif figure (`font-serif font-semibold text-4xl`,
  matching the Dashboard's other headline treatments). Colour follows sign: `deposit`
  when non-negative, `withdrawal` when negative — no third colour for a positive Net
  (the old `brass-ink` used for this is dropped; `brass` is fills/borders only per
  ADR0010's token table, and there's no reason a positive Net needs a colour distinct
  from Income's).
- Below that, **Income and Expenses as two stacked rows**, each with a small
  directional icon (`ArrowDownLeft` for Income, `ArrowUpRight` for Expenses), the
  amount, and its own single-colour bar (`deposit`/`withdrawal`) — not one combined
  two-colour bar. Whichever of the two is larger is the 100% baseline; the other is
  scaled against it. Income isn't fixed at 100% with Expenses capped there too — a
  month with expenses several times income would then show two full-looking bars,
  hiding exactly the thing this card exists to surface. The Expenses row also carries
  a **"N% of income"** figure next to its amount (undefined income shows "—", not a
  misleading 0% or Infinity).

The category breakdown list is retitled **"Spending by category"** (was "By
category") and, unchanged in structure otherwise — still a ranked list with
horizontal bars, per ADR0010 — gains two things at the same time, reusing what
`style/categories-page` and `style/transactions-page` already built:
- A **percentage-of-total** figure next to each row's amount (percentage of the sum of
  all category totals shown, i.e. total Expenses for the current Dashboard).
- The **bar's fill colour** matches that Category's deterministic swatch
  (`lib/categorySwatch.js`'s `categoryBarClass`, new alongside the existing
  `categoryTileClasses`) instead of a uniform `bg-ink`, and each row gets the same
  icon tile (`categoryTileClasses` + `categoryIcon`) the other two pages use.

## Consequences
- Matches the user's actual intended layout precisely, closing the gap ADR0010 left
  loose.
- The three-tile `Stat` component this replaces is gone; nothing else used it.
- `categoryBarClass` and `categoryTileClasses` now share one swatch-selection function
  internally (`lib/categorySwatch.js`), so the Dashboard, Transactions, and Categories
  pages are guaranteed to agree on which colour a given Category gets — no separate
  logic to drift out of sync.
- Still a stopgap pending Sprint 3's real per-Category colour/icon (`docs/backlog.md`):
  once that lands, the Dashboard's bars and tiles pick it up automatically through the
  same shared functions, no separate change needed here.
