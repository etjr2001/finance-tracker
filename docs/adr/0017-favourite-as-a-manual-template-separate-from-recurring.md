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
- **The server takes explicit fields.** `POST /api/favourites` takes `{ type, categoryId, amount, note }`. "Save as favourite" on a Transaction and "+ Add" on the Favourites page both send the same request. The first just opens the Favourite form over the Transactions list, prefilled from the Transaction, so the User keeps their place; opening it on the Favourites page was tried first and felt like an abrupt jump. The Category must belong to the User, checked the same way as for a Transaction.
- **Favourites have their own page,** a nav tab for adding, editing and deleting them. They are only used from the Transaction form, so the page never creates a Transaction.
- **Favourites are listed A–Z by name,** on the page and in the picker below. The name is the note, or the Category when there's no note; case is ignored, and equal names keep their creation order. The API still returns newest first and the frontend sorts. A User-chosen order is a possible later addition (`docs/backlog.md`).
- **Using a Favourite only prefills the form.** A Favourites button in the Add transaction form opens the list, and picking one fills in its type, amount, Category and note. The date is left as it is, which is today unless the User changed it. The User can edit any field, and nothing is saved until they tap "+ Add", which goes through the usual create-Transaction path. There is no server call for using a Favourite, and nothing links the new Transaction back to it. With no Favourites, the list links to the Favourites page and doesn't return afterwards: bringing the User back would mean preserving a half-filled form, and that only happens once.
- **A Transaction's star shows whether it already matches a Favourite.** It's worked out in the frontend by comparing fields, never stored, so nothing links the two: same type, Category and note (ignoring case and surrounding spaces), and the same amount to the cent, except that a zero-amount Favourite matches any amount. The date is ignored. An outline star opens Add favourite prefilled from the Transaction; a filled star opens Edit favourite for the Favourite it matches (an exact amount wins over a zero-amount one, then the oldest), both in place on the Transactions page. No server call or column is needed for this.
- **A Favourite can be edited.** `PUT /api/favourites/{id}` takes the same fields as create and replaces all of them, with the same ownership checks on the Favourite and the Category. Editing a Favourite never changes Transactions already created from it, since nothing links them. Leaving edit out was considered (delete and recreate instead) and rejected: a stale amount (e.g. a price rise) would then be retyped on every use, which defeats the point of a Favourite.
- **Duplicates are allowed.** No uniqueness rule on any combination of fields.
- **A Category used by a Favourite can't be deleted,** the same rule as a Category used by a Transaction.
- **Demo mode mirrors it** in `demoApi.js`, per ADR0009, and Reset demo data clears Favourites too.

## Consequences
- Favourite ships without any scheduling infrastructure. Recurring can be designed on its own terms without reshaping Favourite.
- Recurring will copy some of Favourite's columns (type, Category, amount, note). That duplication is accepted in exchange for neither table having half-empty rows.
- Since nothing links a Transaction to the Favourite it came from, there's no "used N times" count or "most used first" ordering. Adding one later needs a new nullable column on Transaction.
- Because the filled star comes from matching fields, editing a Favourite or a Transaction can change which stars are filled. That is by design: the star means "you have a Favourite like this", not "this was made from a Favourite".
- A User can't remove a Category until they delete every Favourite using it. The in-use error message should mention Favourites, so it isn't confusing when the Category has no Transactions.
- When Currency is built (`CONTEXT.md`), Favourite's amount needs the same widening and currency handling as Transaction's.
