# Backlog & Tech Debt

Living document. Not an ADR: this tracks *what's outstanding*, not *decisions made*. See `docs/adr/` for those, and `docs/sprints/` for sprint reviews.

## Tech debt

- **No backend test suite (pre-ADR0007).** The boilerplate smoke test was deleted in sprint 1, and nothing has replaced it yet. This is being addressed going forward per ADR0007 (tests land alongside whatever code is next touched), not backfilled all at once.
- **#4 changed `GlobalExceptionHandler` without a test.** This slipped past ADR0007. The next change to that file should bring a unit test covering the handlers it touches, with no Spring context needed.
- **Category uniqueness is case-sensitive in the backend.** `CONTEXT.md` says names are unique per User ignoring case, and inline create in `TransactionForm` follows that. But the `(user_id, name)` unique constraint and `existsByUserIdAndName` are case-sensitive, so the Categories page can create "groceries" next to "Groceries". The planned fix, with tests per ADR0007:
  - Use `existsByUserIdAndNameIgnoreCase` in `CategoryService`, for both create and rename.
  - A Flyway `V2__…` migration that replaces the existing unique constraint with a unique index on `(user_id, upper(name))`. The index uses `upper` because Spring Data's `IgnoreCase` generates `upper(name) = upper(?)`, and Postgres only uses a function index when the query calls the same function.
  - Replacing the index rather than adding one keeps the index count the same. With tens of Categories per User and rare inserts, the lookup cost is negligible.
  - **Open, and must happen first:** check prod for existing case-duplicates per User. The migration fails if any exist, so decide how to merge them (re-point their Transactions, then delete the duplicate).
  - *Considered and rejected:* storing only uppercase names. It gives the same speed but throws away the casing the User typed.
- **The Dashboard breakdown includes Drafts.** `DashboardService.buildCategoryBreakdown` should exclude zero-amount Transactions, so that Categories containing only Drafts don't appear as `$0.00` rows (ADR0008, `CONTEXT.md`). Needs a test.
- **Inconsistent DTO usage.** Some endpoints serialize entities directly; others use `Response` DTOs. This was never unified. Scoped into sprint 3, Bundle A.
- **No pagination on `GET /api/transactions`.** Fine at current volume, but it will degrade as the transaction count grows. Scoped into sprint 3, Bundle A.
- **No custom domain/DNS.** The app is live on the default Railway URL. Explicitly non-blocking, parked indefinitely.

## Backlog (not yet scheduled into a sprint)

- **Payment Method.** Explicitly deferred to v2 per `CONTEXT.md`. Not a candidate for any near-term sprint; it's a genuinely separate domain concept, not a bug or polish item.

## Sprint history

### Sprint 1: complete
See `docs/sprints/sprint-1-review.md`.

### Sprint 2: complete
Branch 1 quick fixes (#2), Branch 2 transaction modal and dirty-check (#3), and the Category dropdown sort and inline create (#4). See `docs/sprints/sprint-2-review.md`.

### Sprint 3: planned, not started
The rough order was chosen for dependency reasons (Category color feeds the chart) and to bundle work that touches the same files:

1. **Category color/icon.** Standalone, cheap, no dependencies.
2. **Bundle A: transaction querying.** Search/filter, pagination, and the DTO consistency cleanup. Grouped because they all touch `TransactionController`, `TransactionRepository`, and the response shape.
3. **Bundle B: dashboard visuals.** Grouped because the chart is more useful once a range can be picked, and benefits from Category color existing first if it's color-coded by Category.
   - Date range picker.
   - Dashboard chart.
   - Dashboard tabs: Expense / Income / Overall. The Income tab mirrors the Expense one. There are two open questions to settle before building "Overall":
     - What Overall shows per Category: net (Income − Expense, so a Groceries refund reduces Groceries spend), or both side by side.
     - Whether Categories should become typed (Income-only or Expense-only). Today any Category can hold either. Typing them would be a glossary change and probably an ADR.

All sprint 3 work follows ADR0007: tests land with each bundle, not as a separate pass.
