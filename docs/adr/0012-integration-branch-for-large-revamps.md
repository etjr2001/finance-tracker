# 0012. Use a temporary integration branch for large, multi-branch revamps

## Status
Accepted

## Context
ADR0006 settled on trunk-based development: short-lived branches cut from `main` and
merged back within a day or two, with no `develop` or release branches. Every merge to
`main` redeploys prod (ADR0001), including the public `/demo` landing page (ADR0009).

The frontend revamp (ADR0010, ADR0011) is planned as about ten branches in sequence
(`docs/backlog.md`). Shipping each one straight to `main` meant prod would show the app
part-way through the revamp for weeks. ADR0010 handled that with a rule that each branch
must leave every page it touches fully in one style, but that has a cost: the first
branch (`style/design-tokens`) already needed a throwaway stopgap for the active nav item,
which the later `style/layout-shell` branch replaces anyway.

Alternatives considered:
- **Keep ADR0006 as-is for the revamp.** Every step is small and independently
  reviewed, but prod shows an app in transition, and each branch pays for stopgaps
  that get thrown away later.
- **A feature flag for the new design.** Rejected in ADR0010: it would mean maintaining
  both styles side by side in every component.
- **One big revamp branch with no sub-branches.** Gives up the small, reviewable steps.
- **Make an integration branch the permanent model (`develop`).** Rejected for the same
  reasons as in ADR0006: it adds process this single-developer project doesn't need
  for normal work.

## Decision
ADR0006 remains the default. As an exception, a large revamp that spans many branches
and would otherwise leave prod in a mixed state may use a temporary integration branch:

- Cut the integration branch from `main`, named per ADR0006 (the frontend revamp uses
  `feat/frontend-revamp`).
- Cut sub-branches from the integration branch using the usual `<type>/<short-description>`
  names, and merge them back into it. Each sub-branch is still short-lived and still
  brings its own tests (ADR0007).
- CI keeps running only for `main`. Before a sub-branch merges into the integration
  branch, the frontend tests, lint, and production build are run locally (the same
  checks CI runs). CI then runs on the integration branch's final pull request into
  `main`.
- Any fix that lands on `main` while the integration branch is open is merged into the
  integration branch soon after, so the final merge doesn't hide conflicts.
- The integration branch merges into `main` once, using a merge commit, not a squash,
  so the sub-branch history survives.
- Afterwards, the integration branch is deleted.

For the frontend revamp, this amends one consequence of ADR0010: "each branch must leave
every page it touches fully in one style" applies to the integration branch when it
merges into `main`, not to each sub-branch. Temporary inconsistencies between
sub-branches are acceptable while the integration branch is open.

## Consequences
- Prod and `/demo` go from the old design to the new one in a single deploy, with no
  in-between states and no throwaway stopgaps.
- The integration branch lives for weeks, which is the drift ADR0006 warns about. This is
  acceptable because only one developer works on the project, and the next piece of work
  (Sprint 3) waits for the revamp anyway, so `main` should see little else.
- The single merge into `main` is large. Visually checking the whole app at desktop and
  mobile widths before that merge becomes the main safeguard.
- Merging `main` into the integration branch is a manual step that is easy to forget.
- Sub-branches rely on local checks, not CI. A skipped local run lets a broken test or
  build sit on the integration branch until the final pull request into `main`, where
  it is harder to trace back to the sub-branch that caused it. Adding the integration
  branch to CI's triggers was considered and judged unnecessary for a single developer.
- Meant to be rare: only for a revamp big enough to otherwise leave prod in a mixed state,
  not for ordinary features, however many files they touch.
