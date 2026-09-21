# Context: Finance Tracker

Glossary of domain terms. No implementation details — see `docs/adr/` for those.

## User
An account holder. Owns all their own Transactions and Categories; no one else can see them.

## Transaction
A single money movement: either an **Expense** or **Income**. Has an amount (zero or more, never negative), a date, a Category, an optional note, and belongs to exactly one User.

## Draft
A Transaction whose amount is zero, meaning the amount isn't known yet and will be filled in later. Not used for genuinely zero-value movements. A Draft is still an Expense or Income with a Category; it stops being a Draft when it gets a non-zero amount. See ADR0008.

## Category
A user-defined label for a Transaction (e.g. "Groceries", "Salary"). Flat — no subcategories. Each User has their own set, seeded with a starter list on signup, editable after that. Category names are unique per User, ignoring case: "groceries" and "Groceries" are the same Category, and the name keeps the casing the User typed.

## Payment Method
A second, independent label on a Transaction (e.g. "Cash", "Credit Card", "Bank Transfer"), distinct from Category — used to slice the Dashboard by how money moved, not what it was for. **Deferred to v2**; captured here because its meaning is settled even though it isn't built yet.

## Dashboard
An aggregated, read-only view over a User's Transactions for a period (default: current month) — total income, total expenses, and a breakdown of Expenses by Category, excluding Drafts.
