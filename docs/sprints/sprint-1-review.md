# Sprint 1 Review

> **Correction (added when these docs moved into the repo):** the "Scope cuts" section below says $0 transactions were ruled out with `@DecimalMin("0.01")`. That was already out of date when this review was written: commit `2319f4d` (2026-09-13) allowed zero amounts. Zero-amount Transactions are now Drafts; see ADR0008. The password-reset branch was actually named `feature/password-reset`, before ADR0006's `feat/` convention. The rest of this review is kept as originally written.

**Goal:** ship the full domain model (`CONTEXT.md`) end-to-end as one deployable, live in prod.

## Shipped
- **Auth**: Supabase Auth signup/login, with the JWT verified by Spring Boot as an OAuth2 resource server (no self-issued tokens)
- **Category**: full CRUD, flat, seeded with a starter list on signup. Seeding confirmed working in prod
- **Transaction**: full CRUD, Expense/Income, amount/date/Category/note, ownership-scoped (cross-user 403/404 verified)
- **Dashboard**: aggregated read-only view for the current month, with income/expenses/category breakdown
- **Deployment**: a single Railway service serving both the built SPA and the API (ADR0001), with Supabase Postgres in prod (ADR0005)
- **Password reset**: added mid-sprint, shipped and merged (`feat/password-reset`)

## Key decisions and pivots
- ADR0003 (self-issued JWT) was superseded by ADR0004 (Supabase Auth) once Supabase was adopted for the DB anyway
- ADR0002 (Railway Postgres) was superseded by ADR0005 (Supabase Postgres), for the same reason
- ADR0006: trunk-based branching was formalized once real feature work (password reset) started

## Bugs caught and fixed during the sprint
These weren't part of the original plan; they were found during testing.
- Login flashed and then bounced back to `/login`. `AuthProvider` relied on an async listener instead of the session returned directly from `signInWithPassword`
- Jackson/Hibernate proxy serialization issue on JSON responses
- Missing `JOIN FETCH` on category in transaction queries
- Missing routes/links (Categories route, Login→Signup link) from early frontend work

## Scope cuts, made deliberately
- Payment Method: explicitly deferred to v2 per `CONTEXT.md`, never in scope
- Category management kept as its own page rather than folded into settings or a modal. Decided early, not revisited
- Draft/partial transactions and $0 transactions ruled out; `@DecimalMin("0.01")` enforced *(see correction above)*

## Debt carried into the backlog
- No backend test suite: the boilerplate smoke test was deleted, and the `TODO: tests` note was never addressed
- Inconsistent DTO usage: some endpoints serialize entities directly instead of using `Response` DTOs
- Domain/DNS: still on the default Railway URL, explicitly non-blocking
