# 0017. Favourite as a manual template, separate from Recurring

## Status
Accepted

## Context
The backlog had Favourite (a manual shortcut for creating a Transaction) and Recurring (time-based, e.g. a monthly bill or paycheck) as two items. While planning to bring both forward ahead of Sprint 4, a first grilling pass merged them into one concept: a template that the User either picks manually or that runs on a schedule. A second pass (2026-10-11) reversed that, for three reasons:

- Other apps keep the two apart. YNAB has scheduled transactions, and banks have payee templates and standing orders as separate features.
- A merged template would need schedule fields that are empty for every manual one. Every query, form and rule would branch on "is this one scheduled?"
- Recurring needs a background job, two date anchors and re-anchoring on edit (planned for ADR0018). Favourite needs none of that, so it can ship first on its own.

Alternatives considered for how a Favourite is created:
- **From a Transaction only** (`POST /api/favourites/from-transaction/{id}`, the server copies the fields). Rejected: it rules out creating one from scratch, and the User wants to adjust fields (e.g. the amount) before saving.
- **A Transaction with a "favourite" flag.** Rejected: a Favourite has no date and isn't money that moved, so it would leak into the Transactions list, the Drafts list and the Dashboard unless every query filtered it out.

## Decision
- **Favourite and Recurring are two terms and two tables.** This ADR covers Favourite. Recurring gets its own ADR when it's built.
- **A Favourite stores type, Category, amount and an optional note.** It has no date. Amount is zero or more. Zero is allowed and prefills a Draft (ADR0008). The note follows the Transaction note's 256-character limit.
- **The server takes explicit fields.** `POST /api/favourites` takes `{ type, categoryId, amount, note }`. "Save as favourite" on a Transaction and "+ New favourite" both send the same request. The first just opens the form prefilled from the Transaction. The Category must belong to the User, checked the same way as for a Transaction.
- **Using a Favourite only prefills the form.** Picking one opens the normal Transaction form filled from the Favourite and dated today. The User can edit any field, and nothing is saved until they tap Save, which goes through the usual create-Transaction path. There is no server call for using a Favourite, and nothing links the new Transaction back to it.
- **No editing a Favourite in the first version.** A User deletes and recreates one instead. Amounts are usually overridden when a Favourite is used, so editing is rarely needed.
- **Duplicates are allowed.** No uniqueness rule on any combination of fields.
- **A Category used by a Favourite can't be deleted,** the same rule as a Category used by a Transaction.
- **Demo mode mirrors it** in `demoApi.js`, per ADR0009, and Reset demo data clears Favourites too.

## Consequences
- Favourite ships without any scheduling infrastructure. Recurring can be designed on its own terms without reshaping Favourite.
- Recurring will copy some of Favourite's columns (type, Category, amount, note). That duplication is accepted in exchange for neither table having half-empty rows.
- Since nothing links a Transaction to the Favourite it came from, there's no "used N times" count or "most used first" ordering. Adding one later needs a new nullable column on Transaction.
- A User can't remove a Category until they delete every Favourite using it. The in-use error message should mention Favourites, so it isn't confusing when the Category has no Transactions.
- No edit means a typo costs a delete and recreate. If that grates, editing is a small follow-up (`PUT /api/favourites/{id}`), tracked in `docs/backlog.md`.
- When Currency is built (`CONTEXT.md`), Favourite's amount needs the same widening and currency handling as Transaction's.
