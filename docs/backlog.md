# Backlog & Tech Debt

Living document. Not an ADR: this tracks *what's outstanding*, not *decisions made*. See `docs/adr/` for those, and `docs/sprints/` for sprint reviews.

## Tech debt

- **No backend test suite (pre-ADR0007).** The boilerplate smoke test was deleted in sprint 1, and nothing has replaced it yet. This is being addressed going forward per ADR0007 (tests land alongside whatever code is next touched), not backfilled all at once.
- **Category uniqueness is case-sensitive in the backend.** `CONTEXT.md` says names are unique per User ignoring case, and inline create in `TransactionForm` follows that. But the `(user_id, name)` unique constraint and `existsByUserIdAndName` are case-sensitive, so the Categories page can create "groceries" next to "Groceries". The planned fix, with tests per ADR0007:
  - Use `existsByUserIdAndNameIgnoreCase` in `CategoryService`, for both create and rename.
  - A Flyway `V2__…` migration that replaces the existing unique constraint with a unique index on `(user_id, upper(name))`. The index uses `upper` because Spring Data's `IgnoreCase` generates `upper(name) = upper(?)`, and Postgres only uses a function index when the query calls the same function.
  - Replacing the index rather than adding one keeps the index count the same. With tens of Categories per User and rare inserts, the lookup cost is negligible.
  - **Open, and must happen first:** check prod for existing case-duplicates per User. The migration fails if any exist, so decide how to merge them (re-point their Transactions, then delete the duplicate).
  - *Considered and rejected:* storing only uppercase names. It gives the same speed but throws away the casing the User typed.
- **Inconsistent DTO usage.** Some endpoints serialize entities directly; others use `Response` DTOs. This was never unified. Scoped into sprint 3, Bundle A.
- **No pagination on `GET /api/transactions`.** Fine at current volume, but it will degrade as the transaction count grows. Scoped into sprint 3, Bundle A.
- **No custom domain/DNS.** The app is live on the default Railway URL. Explicitly non-blocking, parked indefinitely.

## Backlog (not yet scheduled into a sprint)

- **Payment Method.** Explicitly deferred to v2 per `CONTEXT.md`. Not a candidate for any near-term sprint; it's a genuinely separate domain concept, not a bug or polish item.
- **Installable PWA (manifest + service worker, offline support).** Out of scope for the pre-Sprint-3 hardening batch below, which only adds a minimal manifest to fix iOS storage persistence. A real installable PWA is a separate feature, not a bug fix.
- **Transaction row: collapsed mobile row + detail view card.** On narrow viewports, `TransactionsPage.jsx`'s row crams date, category, Draft badge, note, amount, and inline Edit/Delete into one line with no responsive variant — the note truncates to near-illegible. Settled design (grilled — not yet built):
  - Gate on viewport width (same `md:` breakpoint `TransactionForm.jsx` already uses for `grid-cols-1 md:grid-cols-2`), not platform/PWA detection — `manifest.json` already sets `display: standalone` for the home-screen launch, but it's the same responsive CSS either way.
  - Below `md`: each row collapses to date + category + Draft badge only (no note preview — avoids reintroducing the same crowding one field earlier). Tapping the row opens a read-only detail card (`Modal.jsx`-based, mirroring `ConfirmDialog.jsx`'s shape) showing the full transaction — date, category, amount, type, untruncated note — with Edit and Delete buttons that close the card and hand off to the page's existing `openEdit`/`requestDelete` flows. No new mutation logic.
  - At `md` and up (including desktop web): unchanged, current inline-row behavior.
  - Suggested branch: `feat/transaction-detail-view`, cut from `main`.

## Sprint history

### Sprint 1: complete
See `docs/sprints/sprint-1-review.md`.

### Sprint 2: complete
Branch 1 quick fixes (#2), Branch 2 transaction modal and dirty-check (#3), and the Category dropdown sort and inline create (#4). See `docs/sprints/sprint-2-review.md`.

### Pre-Sprint-3 hardening: complete
Not a numbered sprint — a batch of bug fixes and tech debt cleanup found ahead of Sprint 3, shipped as independent branches:

- **Request validation gaps (#6).** `amount` capped to fit `numeric(12,2)` (±9,999,999,999.99), `note` capped to 256 chars, category `name` to 50 — matched on frontend and backend. DB-level `CHECK` constraints added `NOT VALID` (`V2__note_and_name_length_checks.sql`) so the migration couldn't fail on existing over-length rows.
  - **Still open:** check prod for existing `note`/`name` values over the new limits, decide how to shorten them, then run `ALTER TABLE ... VALIDATE CONSTRAINT ...` to close the gap. Same open item as the category case-insensitivity fix above — worth doing both checks in the same pass.
- **Raw DB error leaked to the frontend + no backend logging (#7).** `GlobalExceptionHandler.handleDataIntegrityViolation` no longer returns `ex.getMessage()` (raw Postgres/Hibernate text) to the client — generic message instead, real exception logged server-side. Every handler now logs via SLF4J, where previously none did, including the catch-all. Added `GlobalExceptionHandlerTest` covering every handler, closing the tech-debt item from #4 where this file was changed without a test.
- **Date input rendering wider/taller than other fields on iOS Safari (#8, #9).** Root cause was iOS's native `<input type="date">` rendering, not generic browser chrome — confirmed only reproducible on real Safari, not Chrome's mobile device emulation (which still renders form controls with Blink, not WebKit). First attempt (`min-w-0`/`h-10`) didn't fix it; the working fix was `appearance-none`/`-webkit-appearance:none` on the date input, same technique already used for the Category select.
- **JWT lost on every iOS home-screen relaunch (#10).** Not a Supabase config issue — iOS home-screen bookmarks added without a Web App Manifest don't reliably persist `localStorage` across relaunches. Added a minimal `manifest.json` (name, icons, `display: standalone`, `start_url`) plus `apple-touch-icon`/`apple-mobile-web-app-capable` meta tags. No service worker, no offline support — scoped purely to fix storage persistence, not to make the app an installable PWA (see backlog item above). Also replaced `favicon.svg` (previously a generic purple/blue mark that didn't match the app's palette) with a design in the app's actual colors, and fixed `index.html`'s `<title>` (was the default Vite placeholder).
- **Mobile form UX (`fix/mobile-form-ux`).** Found while testing #10 on a real device, not part of the original five bugs: `TransactionForm` now stacks one field per line on mobile and two on web; the amount field blocks a keystroke that would exceed `numeric(12,2)`'s range instead of only warning on submit, with an inline hint so the block doesn't look like broken input; and `TransactionForm`/`CategoriesPage` inputs moved from `text-sm` (14px) to `text-base` (16px), since iOS Safari auto-zooms the viewport on focus for any input under 16px and doesn't reliably zoom back out.
- **Frontend-only `/demo` mode (#12).** Every route behind `ProtectedRoute` meant a cold visitor hit a signup wall before seeing anything work. `/demo` (ADR0009) renders the real Dashboard/Transactions/Categories UI against browser-local state (`frontend/src/demo/`) — no backend or Supabase calls — and is now the default landing page for a logged-out visitor. Same PR closed a validation gap found while building it: `TransactionForm`'s amount field blocked exceeding the `numeric(12,2)` max but not extra decimal places, which the backend already rejected via `@Digits(fraction = 2)` but the demo (with no backend to catch it) didn't guard against at all.
- **Dashboard breakdown included Drafts (#13).** `DashboardService.buildCategoryBreakdown` didn't actually exclude zero-amount Transactions, despite ADR0008 documenting that as the decision — surfaced because `/demo` mode's client-side dashboard implemented the correct behavior, so the real app started visibly disagreeing with its own demo. Fixed, with `DashboardServiceTest`, the first backend service-layer test in the repo.

See `docs/sprints/pre-sprint-3-hardening-review.md`.

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
