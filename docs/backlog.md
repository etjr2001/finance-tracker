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
- **Installable PWA (manifest + service worker, offline support).** Out of scope for the pre-Sprint-3 hardening batch below, which only adds a minimal manifest to fix iOS storage persistence. A real installable PWA is a separate feature, not a bug fix.

## Pre-Sprint-3 hardening

Not a numbered sprint — a batch of bug fixes and tech debt cleanup found ahead of Sprint 3, shipped as independent branches so each can be reviewed and merged on its own:

- **Request validation gaps.** `TransactionRequest`/`CategoryRequest` already validate presence and non-negative amount, but `amount` has no upper bound (the `numeric(12,2)` column can overflow and currently leaks a raw DB error — see next item), and `note`/category `name` have no length cap, frontend or backend. Fix: cap `amount` to fit `numeric(12,2)` (±9,999,999,999.99), cap `note` to 256 chars and `name` to 50, matched on both frontend and backend. `date` stays unbounded — no domain reason to restrict it yet.
  - DB-level `CHECK` constraints (`V2__note_and_name_length_checks.sql`) were added `NOT VALID` so the migration can't fail on existing over-length rows — they're enforced for new writes immediately but existing data is grandfathered in.
  - **Open:** check prod for existing `note`/`name` values over the new limits, decide how to shorten them, then run `ALTER TABLE ... VALIDATE CONSTRAINT ...` to close the gap. Same open item as the category case-insensitivity fix below — worth doing both checks in the same pass.
- **Raw DB error leaked to the frontend.** `GlobalExceptionHandler.handleDataIntegrityViolation` returns `ex.getMessage()` directly — raw Postgres/Hibernate text (e.g. constraint names) reaching the client. Every other handler already returns a hand-written, safe message. Fix: generic message for this one handler; log the real exception server-side (see next item). Bundled with the logging fix since it's the same file/methods.
- **No logging anywhere in the backend.** No `Logger`/SLF4J usage exists despite Spring Boot bundling it for free. Fix: every handler in `GlobalExceptionHandler` logs the exception before responding, stdout only (Railway captures it). Auth-event/request logging is a possible future item, not part of this fix.
- **Date input wider than other fields in `TransactionForm`.** Cosmetic only — the native calendar-icon chrome inside `type="date"` makes it look wider than the amount field despite sharing the same class. CSS-only fix, no test needed (not a logic change per ADR0007).
- **JWT lost on every iOS home-screen relaunch.** Not a Supabase config issue — iOS home-screen bookmarks added without a Web App Manifest don't reliably persist `localStorage` across relaunches. Fix: minimal `manifest.json` (name, icons, `display: standalone`, `start_url`) plus `apple-touch-icon`/`apple-mobile-web-app-capable` meta tags. No service worker, no offline support — this is scoped purely to fix storage persistence, not to make the app an installable PWA (see backlog item above).

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
