# Context: Finance Tracker

Glossary of domain terms. No implementation details — see `docs/adr/` for those.

## User
An account holder. Owns all their own Transactions and Categories; no one else can see them.

## Transaction
A single money movement: either an **Expense** or **Income**. Has an amount (zero or more, never negative), a date, a Category, an optional note, and belongs to exactly one User.

## Draft
A Transaction whose amount is zero, meaning the amount isn't known yet and will be filled in later. Not used for genuinely zero-value movements. A Draft is still an Expense or Income with a Category; it stops being a Draft when it gets a non-zero amount. See ADR0008.

## Favourite
A saved shortcut for creating a Transaction: a reusable template capturing a type (Expense or Income), a Category, an amount, and an optional note, that a User can pick again later to prefill a new Transaction. A User creates one from scratch, or from an existing Transaction. Its amount may be zero, in which case using it prefills a Draft. A User can have two Favourites with the same fields, and can edit or delete a Favourite at any time; editing one doesn't change Transactions already created from it. A Favourite is not itself a Transaction — using one still creates a distinct Transaction, dated the day it's used. Invoked manually, every time; nothing about a Favourite happens on a schedule. Distinct from a **Recurring** item (below), which is time-based (e.g. a monthly subscription or paycheck) rather than user-invoked. See ADR0017.

## Recurring
A time-based template that creates a Transaction on a schedule: every N days, weeks, months or years. Like a Favourite, it captures a type (Expense or Income), a Category, an amount and an optional note. It also has two dates: when each entry is posted, and the date the posted Transaction carries. That date is on or after the post date, so a posted Transaction can be dated later in the month. A date that doesn't exist in a month (e.g. the 31st) falls back to that month's last day. If the amount varies, it posts Drafts. It starts today or later and never posts into the past. It can be stopped, or deleted; Transactions it already posted stay either way. A User creates one from scratch or from an existing Transaction. Distinct from a Favourite, which is invoked manually. See ADR0018.

**Left to avoid spending:** for the current month, the total of Recurring Expenses dated after today, plus a count of varying-amount ones still to come.

## Category
A user-defined label for a Transaction (e.g. "Groceries", "Salary"). Flat — no subcategories. Each User has their own set, seeded with a starter list on signup, editable after that. Category names are unique per User, ignoring case: "groceries" and "Groceries" are the same Category, and the name keeps the casing the User typed.

A Category also has a colour and an icon, picked from a fixed set (not freeform hex values or uploaded images). Both are optional: a Category can have neither set yet. The User can change either at any time. See ADR0010.

## Payment Method
A second, independent label on a Transaction (e.g. "Cash", "Credit Card", "Bank Transfer"), distinct from Category — used to slice the Dashboard by how money moved, not what it was for. **Deferred to v2**; captured here because its meaning is settled even though it isn't built yet.

## Currency
The currency an amount is in. Today every amount is in Singapore dollars (SGD). Each currency has its own number of decimal places (none for JPY, two for SGD, three for KWD), and amounts must be able to hold any of them. **Deferred, not yet scheduled.** Still open: whether a User has one currency for everything, or each Transaction carries its own and the Dashboard converts to the User's home currency. See `docs/backlog.md`.

## Dashboard
An aggregated, read-only view over a User's Transactions for one month: total income, total expenses, and a breakdown of each by Category, excluding Drafts. Each total is shown alongside the same figure for the whole of the previous month. See ADR0014 and ADR0015.
