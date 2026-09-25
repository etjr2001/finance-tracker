# Backlog & Tech Debt

Living document. Not an ADR: this tracks *what's outstanding*, not *decisions made*. See `docs/adr/` for those, and `docs/sprints/` for sprint reviews.

## Tech debt

- **No backend test suite (pre-ADR0007).** The boilerplate smoke test was deleted in sprint 1, and nothing has replaced it yet. This is being addressed going forward per ADR0007 (tests land alongside whatever code is next touched), not backfilled all at once.
- ~~**Category uniqueness is case-sensitive in the backend.**~~ Done (`fix/category-name-case-insensitive`, `V4__category_name_case_insensitive_unique.sql`). `CategoryRepository`/`CategoryService` switched to `existsByUserIdAndNameIgnoreCase` (create) and `existsByUserIdAndNameIgnoreCaseAndIdNot` (rename — excludes the Category's own row, so renaming "Groceries" to "groceries" is a casing change, not a rejected collision with itself). Checked first: no existing case-duplicate names, so the migration needed no data cleanup. Replaced `uq_categories_user_name` with a unique index on `(user_id, upper(name))`, matching the `upper()` Spring Data's `IgnoreCase` generates.
  - **Merge order:** numbered `V4` because `V3` belongs to `feat/category-color-icon` (Sprint 3 item 1). `V3` merged to `main` first (#30), so this one is clear to follow it.
  - *Considered and rejected:* storing only uppercase names. It gives the same speed but throws away the casing the User typed.
- **Inconsistent DTO usage.** Some endpoints serialize entities directly; others use `Response` DTOs. This was never unified. Scoped into sprint 3, Bundle A.
- **No pagination on `GET /api/transactions`.** Much less urgent since ADR0011: the Transactions page now shows one month at a time. Scoped into sprint 3, Bundle A, as optional and deferrable.
- **No custom domain/DNS.** The app is live on the default Railway URL. Explicitly non-blocking, parked indefinitely.
- ~~**Bottom tab bar feels too narrow to tap comfortably on phone.**~~ Fixed (`fix/nav-bar-tap-targets-and-new-transaction-date`): grew the `NavLink`s from `min-h-11`/`py-1.5` to `min-h-14`/`py-2`, so the tap targets themselves sit clear of the iPhone home-indicator gesture area — the existing `pb-[env(safe-area-inset-bottom)]` only cleared the bar's *background* there, not the tappable zone. Awaiting on-device confirmation this was the whole story.

## Backlog (not yet scheduled into a sprint)

- **Payment Method.** Explicitly deferred to v2 per `CONTEXT.md`. Not a candidate for any near-term sprint; it's a genuinely separate domain concept, not a bug or polish item.
- **Installable PWA (manifest + service worker, offline support).** Out of scope for the pre-Sprint-3 hardening batch below, which only adds a minimal manifest to fix iOS storage persistence. A real installable PWA is a separate feature, not a bug fix.
- **Duplicate transaction (clone action).** Pick an existing transaction, get a prefilled form to create a new one from it. Settled scope (grilled) — not yet scoped into a branch.
- **Duplicate transaction detection.** Distinct from the clone action above — the app flagging likely-accidental double-entries (e.g. same amount/category/date entered twice). Parked as an idea to explore later; no definition yet of what counts as a match.
- **Favourite transactions.** Settled domain concept (`CONTEXT.md`): a reusable Transaction template (Category + amount + note) created from an existing Transaction, picked again later to prefill a new one — manual trigger only, no scheduling. Ship before Recurring below; needs no new infrastructure.
- **Recurring transactions.** Time-based repetition (e.g. a monthly subscription or a paycheck) — distinct from Favourite (`CONTEXT.md`). Not yet fully defined: schedule granularity, and whether it auto-creates Transactions (or Drafts, for amounts that vary) or just reminds the User to enter one. Needs real domain definition before implementation, and new scheduling/background-job infrastructure this app doesn't have today — the account-pool approach ADR0009 considered and rejected for demo accounts hit the same gap.
- **CSV export of all Transactions.** Since ADR0011 the UI only ever shows one month; this is the route to a User's full history. Not yet scheduled. Planned shape:
  - Real accounts: a backend endpoint (e.g. `GET /api/transactions/export`) returning every Transaction as CSV, rather than paging through the list endpoint client-side.
  - Demo mode: generated in the browser from `demoApi.js`'s data. Both go through a hook, per ADR0009.
  - The Supabase token is attached by the axios interceptor, so a plain `<a href>` download would be unauthenticated. Fetch through axios as a blob, then save it.
- **Dashboard chart type toggle.** Let the User switch the "Spending by category" breakdown between the current bar-list view and a pie chart. Not yet scoped: needs a decision on whether a pie chart can stay CSS-only (e.g. `conic-gradient`) or requires revisiting ADR0010's "no charting library" call, which was explicitly left open to revisiting "if a chart CSS handles badly is scoped, such as a trend over time" — a pie chart wasn't the case in mind there, so this needs its own look before building. Also needs: where the toggle lives in the UI, and whether the toggle choice persists per-User or resets each visit.

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

### Frontend revamp: complete
The "Passbook" design system (ADR0010) and the global month picker (ADR0011), across the whole frontend. Interaction flow stayed the same, except mobile nav moved to a bottom tab bar. Frontend-only throughout: no backend/API changes, `/demo` kept working (ADR0009). Built on a temporary `feat/frontend-revamp` integration branch (ADR0012, new for this revamp) — eleven sub-branches merged into it, then one real merge commit into `main` (#27) when the whole thing was done, so `main` never saw a half-revamped app. Also shipped in the same working session: `fix/demo-offline-network-mode` (#16) and `fix/nav-bar-tap-targets-and-new-transaction-date` (#28), neither part of the revamp itself.

New ADRs: 0012 (the integration-branch workflow) and 0013 (the Dashboard's single-Net-card layout, settled mid-revamp and formalised after).

See `docs/sprints/frontend-revamp-review.md` for what shipped branch-by-branch, what went well, and the bugs found along the way (worth reading before touching `features/layout/components/AppLayout.jsx`, `features/month/components/MonthBar.jsx`, or any date-handling code — several of them are exactly the kind of subtle regression that's easy to reintroduce).

### Sprint 3: in progress
Follows the frontend revamp above, so its UI is built directly in the new design system. The rough order was chosen for dependency reasons (Category color feeds the chart) and to bundle work that touches the same files. Every item that touches the API keeps `demoApi.js` returning the same shapes, in the same branch (ADR0009). Item 1 (Category color/icon) is done; Bundles A and B below are not started.

1. ~~**Category color/icon.**~~ Done (`feat/category-color-icon`). Built as designed (grilled — a DB-backed lookup table with FK-validated keys was considered and rejected: it would need a synced-but-duplicate frontend registry anyway, since ADR0010 requires code-based colour tokens and explicitly-imported icons for tree-shaking, for no real integrity benefit in a single-developer, low-write table), with a few deviations found along the way:
   - Two nullable columns on Category: `color_key varchar(20)` and `icon_key varchar(30)` (e.g. `"ochre"`, `"food"`). Store keys, not hex values or icon names, so the palette can be retuned (ADR0010) and icon-library renames never touch stored data. Both format-checked (a short lowercase slug) at the DTO and the DB (`V3__category_color_icon.sql`), sharing one regex constant (`Category.KEY_FORMAT`) between the entity and the request DTO so they can't drift apart.
   - **Deviates from the original plan:** inline Category creation in `TransactionForm` leaves `color_key`/`icon_key` both `null` (not an auto-assigned colour) — fewest-click still holds, and null already had to be handled everywhere anyway. Creating from the Categories page *does* auto-assign: colour is a deterministic hash of the name, icon is a keyword guess (reusing the same keyword list the old name-guess stopgap used) that falls back to unset (not a wrong guess) when nothing matches. Either can be changed afterwards via the new colour/icon picker on the edit modal.
   - **Deviates from the original plan:** the curated icon registry started at ~20 explicitly-imported Lucide icons, not 40–60 — cheaper to ship and easy to extend later (frontend-only change, no migration).
   - The Categories page's inline rename-only edit became a full edit modal (name, 9-swatch colour picker, icon grid, live preview) — the settled design needed more room than an inline row.
   - Found and fixed along the way: no field ever showed how close a name/note was to its character limit (only `AmountField` had this) — added a shared counter to `FormField`, so the Note field and both Category name inputs get it for free. Also tightened Category name's limit from 50 to 30 (a real display label, not free text — the DB check needed dropping and re-adding since Flyway can't alter a named `CHECK` in place) and fixed a genuine overflow bug where a long, spaceless note wasn't wrapping on desktop (`break-words` was missing alongside `whitespace-normal`).
   - The Categories page list is now sorted by name (it wasn't before, unlike the Transaction form's Category dropdown, which already was).
   - Seeded colours and icons on the demo Categories, reusing the same auto-assign/guess functions as a real Category (`demoSeed.js`).
   - `CONTEXT.md`'s Category entry gains colour and icon.
   - *Considered and rejected:* emoji (inconsistent rendering across platforms, clash with ADR0010), stored SVG markup (XSS risk), user uploads (needs storage infrastructure).
2. **Bundle A: transaction querying.** Grouped because they all touch `TransactionController`, `TransactionRepository`, and the response shape. In order:
   - Server-side month filter on `GET /api/transactions`, replacing the revamp's client-side filtering (ADR0011). Must land before or with pagination.
   - DTO consistency cleanup.
   - Search/filter.
   - Pagination: optional and deferrable since ADR0011. If built, "Load more" with a stable sort (date descending, then id descending), and no day total on the last day group until it is fully loaded.
3. **Bundle B: dashboard visuals.** Grouped because they share the Dashboard, and benefit from Category color existing first.
   - ~~Date range picker~~ — superseded by the global month picker (ADR0011), built in the revamp.
   - Per-Category Income breakdown. Backend change: `DashboardService.buildCategoryBreakdown` only includes Expense Transactions today, and total income is a single figure. Return `{ income, expense }` per Category rather than a precomputed net, so the frontend can derive net and still show both parts.
   - Dashboard tabs: Expense / Income / Overall. The Expense tab's bars are built in the revamp from the existing response; the Income tab mirrors it. Settled (grilled):
     - Overall shows net per Category (Income − Expense, so a Groceries refund reduces Groceries spend) as a diverging CSS bar, with tap or hover revealing both parts.
     - Categories stay untyped — rejected typing them at all, not just deferred it. `Transaction` already has `type` (Expense/Income, `CONTEXT.md`), which is sufficient for the tabs to filter by; there's no need for `Category` to carry a type too, not even as a non-blocking hint. No schema change, no `CONTEXT.md` change, no ADR.

All sprint 3 work follows ADR0007: tests land with each bundle, not as a separate pass.
