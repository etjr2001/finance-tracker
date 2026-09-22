# 0006. Trunk-based branching with short-lived feature branches

## Status
Accepted

## Context
No branching convention has been recorded so far — work has happened without one being named. As the project picks up features (starting with Supabase Auth password reset), it's worth settling this once rather than each branch/PR being an ad-hoc choice.

This is a single-user-at-a-time personal project (ADR0003) with one deployable (ADR0001) and a bias throughout these ADRs toward minimizing process and ceremony (ADR0003, ADR0004). A heavier model like Gitflow (`main` + `develop`, release branches) assumes a release-management need — multiple in-flight releases, a QA gate before production — that doesn't exist here.

## Decision
Trunk-based development: `main` is always deployable. Work happens on short-lived branches cut from `main`, named `<type>/<short-description>` (e.g. `feat/password-reset`, `fix/dashboard-rounding`). Branches merge back into `main` quickly — ideally within a day or two — rather than accumulating long-lived divergence. No `develop` branch, no release branches.

## Consequences
- Matches the project's existing bias toward minimal process (ADR0003, ADR0004): one branch model to think about, no merge-train between `develop` and `main`.
- `main` being always-deployable matters more here than in a heavier model, since ADR0001 means one push is one deploy of the whole app (frontend + backend together) — there's no separate release branch acting as a buffer.
- Requires discipline to keep branches short-lived; if a feature branch lives for weeks, this convention quietly degrades into long-lived-branch chaos with none of Gitflow's structure to fall back on.
- Revisiting this later (e.g. if the project ever needs a staged release process) is cheap — trunk-based is the easier starting point to add process to, not the harder one to unwind.
