# 0007. Write tests for code touched going forward

## Status
Accepted

## Context
No test suite exists yet. Spring Initializr's default boilerplate smoke test was deleted early in sprint 1 because it required a live Supabase connection just to boot the application context in CI — a `TODO: tests` note was left behind and never picked back up. Since then, auth, full CRUD, ownership checks, and validation have all been built and manually verified, but none of it has automated coverage. Sprint 2 and the sprint 3 backlog (transaction querying, dashboard visuals) both touch a growing surface of the app, and the untested gap keeps growing with it rather than shrinking.

## Decision
From sprint 2 onward, any file that gets a substantive change — new logic, a bug fix, a behavior change — gets accompanying tests landed in the same branch, rather than deferred to a separate "write tests" pass later.

- **Backend**: JUnit 5 + Mockito, via `spring-boot-starter-test` (already on the classpath, no new dependency).
- **Frontend**: Vitest + React Testing Library. Vitest specifically, not Jest — it shares Vite's config and transform pipeline directly, so it needs less setup and less ongoing maintenance against this project's existing Vite-based build than Jest would.

**Scope**: this applies to logic — new behavior, bug fixes, validation, state transitions. Purely cosmetic changes (moving a link, adjusting spacing, copy edits) are exempt; requiring a test for a one-line JSX position change would work against this project's consistent bias toward minimizing ceremony (ADR0003, ADR0004) without adding real regression protection.

## Consequences
- Coverage grows organically as code is actually touched, instead of competing as a separate, easy-to-deprioritize backlog item.
- Backend tooling is free; frontend needs Vitest and React Testing Library added as new devDependencies.
- Existing untested code (auth flow, CRUD, ownership checks) is not backfilled all at once — it accrues coverage the next time each file is genuinely touched, rather than via a dedicated big-bang test-writing sprint.
- Judgment calls remain on what counts as "substantive" vs. "cosmetic" — this isn't a hard line, and the wrong side of it can be corrected in code review rather than needing a rule for every edge case.