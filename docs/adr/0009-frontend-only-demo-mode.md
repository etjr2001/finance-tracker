# 0009. Frontend-only demo mode, no backend or Supabase involvement

## Status
Accepted

## Context
This app is a portfolio piece. Every route except `/login`, `/signup`,
`/forgot-password`, and `/reset-password` is behind `ProtectedRoute` (see `App.jsx`),
so a cold visitor — a recruiter clicking a resume link, or an interviewer opening the
repo's live URL — hits a signup wall before seeing anything work. There is no README,
screenshot, or video either, so the wall is currently the entire first impression.

Two ways to give a visitor a working, clickable app without an account were
considered:

1. **A real, pre-seeded Supabase account (or pool of accounts) that `/demo` logs into.**
   Every existing endpoint works unchanged — real writes, real Postgres, real JWT flow.
   Requires: an account-leasing/reset mechanism to handle concurrent visitors, a
   scheduled cleanup job (new infra — this app has no scheduler today), and, if data is
   to be preserved across a signup, an account-claim/conversion flow with its own
   email-confirmation edge cases. Realistically 1–2 days of work spanning auth,
   scheduling, and data migration.
2. **Frontend-only mocked data.** No backend or Supabase calls; demo state lives in
   browser storage and the existing UI operates on it exactly as it operates on API
   responses today. Buildable in a fraction of the time, zero backend changes, zero new
   infrastructure, no auth-adjacent code touched.

The goal driving this (see `docs/backlog.md` for the fuller context) is landing a SWE
job. Under that goal, "prove the backend is real" — option 1's main advantage — doesn't
move the needle for either audience: a recruiter's 30-second scan never probes
persistence, and an engineer who cares can already read the real Spring Boot code,
Flyway migrations, and this very ADR directory, which is a public part of the repo.
Option 1's extra realism is redundant with the code already being real and readable.

## Decision
`/demo` is a public route, outside `ProtectedRoute`, that renders the real Dashboard,
Transactions, and Categories UI running entirely against browser-local state. No
network calls to `/api/*`, no Supabase calls, of any kind, from `/demo`.

`/demo` is also the default landing page for a logged-out visitor: `ProtectedRoute`
redirects an unauthenticated visit (including root `/` and any deep link) to `/demo`
rather than `/login`, so the working app — not a signup form — is the actual first
impression. `/login` and `/signup` stay directly reachable via typed URL and via links
from the demo itself.

The account-pool approach is not rejected outright — it's deferred. If it's ever built,
it's justified as its own showcase feature (real auth lifecycle, scheduled jobs, data
migration on claim), not as a fix for the signup wall, since the wall problem is fully
solved by this ADR alone.

## Consequences
- A visitor can add, edit, and delete transactions and categories, and see the
  dashboard react, with zero signup friction and zero backend risk (no unauthenticated
  traffic, no demo data ever reaching production Postgres).
- Demo state does not survive a different browser/device, and never did — it's
  explicitly not trying to be a real account.
- If "prove the backend is real" ever becomes a goal in its own right, that's a new
  decision superseding this one, not an extension of it — see `docs/backlog.md`.
- The demo's client-side dashboard aggregation is a from-scratch reimplementation of
  `DashboardService`'s math in JavaScript (see `frontend/src/demo/demoApi.js`), since
  there is no backend call to reuse. It approximates `BigDecimal`'s
  `RoundingMode.HALF_EVEN` rather than replicating it exactly; acceptable because demo
  amounts are seed data or user input already bounded to two decimal places, but it is
  not a general-purpose decimal library.
