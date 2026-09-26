# 0015. Compare Dashboard totals with the whole previous month

## Status
Accepted — supersedes the "no month-to-month comparisons" consequence of 0011. Not yet built (Sprint 4).

## Context
ADR0011 made the selected month global and month-only, and listed as a consequence that
month-to-month comparisons are not available in the UI. The user now wants a comparison
with last month on the Dashboard, while keeping the month as the only unit: arbitrary
date ranges were raised and rejected again ("month is enough").

Choices considered:

- **Which month to compare against.** The month before the one being viewed, or the month
  before today. The Dashboard answers "what happened in this month" (ADR0011), so the
  comparison follows the month picker.
- **Partial-month fairness.** Viewing the current month on the 10th compares 10 days
  against a full month, so this month almost always looks lower. Comparing the same span
  of last month (1st–10th) was considered. The user chose whole month against whole month
  for simplicity, accepting that skew.
- **What to compare.** Only the Net card's totals, or also every Category row. Per-Category
  changes add a figure to every row and raise awkward cases, such as a Category with no
  Transactions last month.
- **A compare on/off switch.** With only one thing to compare against, a switch adds a
  control and a state for no choice.
- **Comparing any chosen month.** Rejected: only the previous month.

## Decision
- The Dashboard compares the **viewed month** with the **whole of the month before it**.
  Both are always whole calendar months, including when the viewed month is the current,
  unfinished one.
- The comparison appears **only in the Net card**: Income, Expenses and Net each show their
  change against the previous month (for example "▲ $120 vs Aug"), in `ink-soft`.
- It is **always shown**. There is no switch and no stored preference.
- Drafts are excluded from both months, as elsewhere on the Dashboard (ADR0008).
- The Dashboard response adds the previous month's totals. `demoApi.js` returns the same
  shape (ADR0009).
- There are still no date ranges. ADR0011's month-only decision otherwise stands.

## Consequences
- "How am I doing compared with last month" is answerable at a glance, without leaving
  the month model.
- Early in the current month the comparison will look favourable by construction. The
  User has accepted this. Switching to a same-period comparison later only changes how the
  previous month's totals are computed, not the response shape or the UI.
- No per-Category comparison. Adding one later extends the breakdown rows from ADR0014.
- Built in Sprint 4 alongside ADR0014, so the Dashboard response changes once.
