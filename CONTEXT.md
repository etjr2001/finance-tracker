# Context: Finance Tracker

Glossary of domain terms. No implementation details — see `docs/adr/` for those.

## User
An account holder. Owns all their own Transactions and Categories; no one else can see them.

## Transaction
A single money movement: either an **Expense** or **Income**. Has an amount (zero or more, never negative), a date, a Category, an optional note, and belongs to exactly one User.

## Draft
A Transaction whose amount is zero, meaning the amount isn't known yet and will be filled in later. Not used for genuinely zero-value movements. A Draft is still an Expense or Income with a Category; it stops being a Draft when it gets a non-zero amount. See ADR0008.

## Favourite
A saved shortcut for creating a Transaction: a reusable template capturing a type (Expense or Income), a Category, an amount, and an optional note, that a User can pick again later to prefill a new Transaction. A User creates one from scratch, or from an existing Transaction (which prefills every field, each still editable before saving). Its amount may be zero, in which case using it prefills a Draft. A User can have two Favourites with the same fields. A Favourite is not itself a Transaction — using one still creates a distinct Transaction, dated the day it's used, which can then be edited before saving like any other. Invoked manually, every time; nothing about a Favourite happens on a schedule. Distinct from a **Recurring** transaction (concept not yet settled — see `docs/backlog.md`), which is time-based (e.g. a monthly subscription or paycheck) rather than user-invoked. See ADR0017.

## Category
A user-defined label for a Transaction (e.g. "Groceries", "Salary"). Flat — no subcategories. Each User has their own set, seeded with a starter list on signup, editable after that. Category names are unique per User, ignoring case: "groceries" and "Groceries" are the same Category, and the name keeps the casing the User typed.

A Category also has a colour and an icon, picked from a fixed set (not freeform hex values or uploaded images). A new Category gets one auto-assigned so it never looks blank, and the User can change either afterwards on the Categories page. A Category created inline from the Transaction form gets no colour/icon yet (both unset) to keep that flow to one step; it can be customised later like any other Category.

## Payment Method
A second, independent label on a Transaction (e.g. "Cash", "Credit Card", "Bank Transfer"), distinct from Category — used to slice the Dashboard by how money moved, not what it was for. **Deferred to v2**; captured here because its meaning is settled even though it isn't built yet.

## Currency
The currency an amount is in. Today every amount is in Singapore dollars (SGD). Each currency has its own number of decimal places (none for JPY, two for SGD, three for KWD), and amounts must be able to hold any of them. **Deferred, not yet scheduled.** Still open: whether a User has one currency for everything, or each Transaction carries its own and the Dashboard converts to the User's home currency. See `docs/backlog.md`.

## Dashboard
An aggregated, read-only view over a User's Transactions for one month: total income, total expenses, and a breakdown of each by Category, excluding Drafts. Each total is shown alongside the same figure for the whole of the previous month. See ADR0014 and ADR0015.
