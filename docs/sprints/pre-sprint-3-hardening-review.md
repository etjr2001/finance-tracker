# Pre-Sprint-3 Hardening Review

**Goal:** clear bugs and tech debt found ahead of Sprint 3, rather than carry them into it. Not a numbered sprint — no new domain features were planned going in; everything here was either a bug fix, a validation/consistency gap, or (in #12's case) the signup-wall problem blocking anyone from seeing the app work at all.

## Shipped
- **Request validation gaps (#6).** `amount`, `note`, and category `name` capped to match backend limits, on both sides, with `NOT VALID` `CHECK` constraints so the migration couldn't fail on existing rows.
- **Raw DB error leaked to the frontend, no backend logging (#7).** Generic error to the client, real exception logged server-side, every handler covered by `GlobalExceptionHandlerTest`.
- **iOS Safari date input rendering wrong (#8, #9).** Root cause was WebKit-specific, not generic mobile chrome — first attempted fix didn't work, `appearance-none` did.
- **JWT lost on every iOS home-screen relaunch (#10).** A missing Web App Manifest, not a Supabase issue — `localStorage` doesn't reliably persist across relaunches without one.
- **Mobile form UX (`fix/mobile-form-ux`).** Found testing #10 on a real device: `TransactionForm` field stacking, amount keystroke-blocking at the `numeric(12,2)` max, 16px inputs to stop iOS auto-zoom.
- **Frontend-only `/demo` mode (#12, ADR0009).** The actual reason for this batch's second half: every route was behind `ProtectedRoute`, so there was nothing for a cold visitor (recruiter, interviewer) to see without signing up. `/demo` runs the real UI against browser-local state, zero backend/Supabase calls, and is now the default landing page for a logged-out visitor. Also closed the amount decimal-place validation gap found while building it (see below).
- **Dashboard breakdown included Drafts (#13).** A backend bug that had gone unnoticed since ADR0008 — `DashboardService` never actually excluded zero-amount Transactions from the category breakdown, despite the ADR documenting that as the decision.

## What went well
- The demo mode work (#12) was scoped tightly through an explicit grilling pass before any code was written: an ADR was drafted, the demo's dashboard aggregation was checked line-by-line against the real `DashboardService`, and Layout/routing edge cases (nav links needing a `/demo` prefix, the logout button needing a demo-aware guard) were caught in planning instead of found later as bugs.
- Bugs found *while* building #12 were triaged individually rather than lumped in:
  - The amount decimal-place gap was judged in-scope for #12 because the demo's own rounding math depended on it being fixed.
  - The Dashboard-Drafts bug was judged out-of-scope for #12 (a backend fix, unrelated to the frontend-only mode) and shipped separately as #13 instead of being bundled in.
  - A transaction-list mobile crowding issue was judged out-of-scope for *both* and deferred to the backlog with a settled design, rather than either being skipped or scope-creeping into whichever branch was open at the time.
- #13 added `DashboardServiceTest` — the first backend service-layer test in the repo, closing part of the long-standing "no backend test suite" tech debt item while touching code that needed a test anyway (ADR0007).

## Found while doing this work
- The amount field's `numeric(12,2)` scale (2 decimal places) was validated on the backend (`@Digits(fraction = 2)`) but not guarded on the frontend at all — a user could type `12.34567` and only find out at submit time on the real app, and the demo (no backend to catch it) would have silently accepted it.
- `DashboardService.buildCategoryBreakdown` never implemented the Draft-exclusion ADR0008 already documented as decided — a two-sprint-old gap that surfaced only because the demo's client-side reimplementation did it correctly and the two started visibly disagreeing.
- `TransactionsPage`'s row layout has no responsive variant at all; on narrow viewports the always-visible amount + Edit/Delete buttons squeeze the note to near-illegible truncation. Design settled (viewport-gated collapsed row + detail card), not yet built — see `docs/backlog.md`.

## Carried into the backlog
- Transaction row: collapsed mobile row + detail view card (`feat/transaction-detail-view`) — design settled, not started.
- Category uniqueness is still case-sensitive in the backend.
- Prod check for existing over-length `note`/`name` values, and for existing Category case-duplicates, both still open.
- Installable PWA (service worker, offline support) — still explicitly deferred.

See `docs/backlog.md` for the full list and Sprint 3's plan.
