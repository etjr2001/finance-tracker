# Frontend Revamp Review

**Goal:** ship the "Passbook" visual design system (ADR0010) and the global month picker (ADR0011) across the whole frontend, in the branch sequence planned in `docs/backlog.md`, using a temporary integration branch (ADR0012, new this session) instead of merging each piece straight to `main`.

## Shipped
Eleven sub-branches, in order, each merged into `feat/frontend-revamp`, then one merge commit (not squash, per ADR0012) into `main` as #27:
- **`style/design-tokens` (#17).** Retuned and new colour tokens, the nine Category swatches, Source Serif 4/IBM Plex Sans weights, tabular numerals, fixed-locale money formatting with U+2212.
- **`refactor/ui-primitives` (#18).** `Button`, `Badge`, `Card`, `FormField` primitives; `Modal`/`ConfirmDialog` moved onto them; adopted across every form in the app.
- **`feat/icons` (#19).** `lucide-react`, applied per ADR0010's conventions.
- **`style/layout-shell` (#20).** Sidebar at `md:`+, bottom tab bar below, compact mobile header, centred shell on wide screens.
- **`style/auth-pages` (#21).** Every auth page/state wrapped in `Card`.
- **`style/categories-page` (#22).** Grid layout, deterministic swatch + name-guessed icon per category (`lib/categorySwatch.js`, `lib/categoryIcon.js`).
- **`style/transactions-page` (#23).** Day-grouped cards, category icon tiles, icon-button Edit/Delete (pulled forward to Categories too once built), shell centring fix, `AddButton` shared widget.
- **`feat/mobile-transaction-row` (#24).** Collapsed mobile row + `TransactionDetail` card; `Modal` backdrop/shadow/padding fixed globally along the way.
- **`feat/global-month-picker` (#25).** `useSelectedMonth()`, `MonthBar`/`MonthPicker`, client-side month filtering, switch-to-month-on-save; skipped the Drafts-in-other-months notice (ADR0011 deviation, recorded in `docs/backlog.md` — throwaway work once month scoping moves server-side).
- **`style/dashboard-page` (#26, ADR0013).** Single Net-card hero summary replacing the three-tile grid, coloured/percentage category bars.

Plus two branches outside the revamp sequence, done in the same session:
- **`fix/demo-offline-network-mode` (#16).** `/demo` mutations hung indefinitely while offline — React Query's default `networkMode: 'online'` doesn't know `demoApi.js` never touches the network.
- **`fix/nav-bar-tap-targets-and-new-transaction-date` (#28).** New-transaction date defaulting to the previous day near midnight (a `toISOString()` UTC-conversion bug, same class ADR0007-era `currentMonth()` already guarded against, just reintroduced independently in `TransactionForm.jsx`); bottom tab bar tap targets grown to clear the iPhone home-indicator area.

New ADRs: **0012** (temporary integration branch for large revamps) and **0013** (Dashboard summary as a single Net card, formalising a layout the user specified mid-revamp that ADR0010 had only described loosely).

## What went well
- **ADR0012's integration-branch workflow worked as designed.** Ten sub-branches merged into `feat/frontend-revamp` with no CI on that branch (local tests/lint/build only, a deliberate scope-cut) and no drift from `main` — the final merge needed no conflict resolution, and landed as a genuine two-parent merge commit, verified by checking its parents directly rather than assuming the GitHub UI did the right thing.
- **Shared logic stayed shared.** `categoryTileClasses`/`categoryIcon` (Categories) were reused as-is by Transactions and Dashboard; `categoryBarClass` was added alongside rather than duplicating the swatch-selection logic. All three pages are structurally guaranteed to agree on a given Category's colour.
- **Every commit ran the full suite, lint, and a production build first** — not just unit tests. Caught real issues (e.g. a lint warning for `setState` inside an effect) before they shipped, and the discipline of checking scoping decisions against ADR0006/ADR0007/ADR0009 caught places where a shortcut would have quietly contradicted a standing decision (e.g. the Categories icon-picker scope question, resolved by checking there was genuinely nowhere to persist the choice yet).
- **Scope was actively pushed back on, not just accepted.** The Categories mockup implied a full colour/icon picker; that was identified as Sprint 3 work (needs a DB migration) and scoped down to a frontend-only stopgap instead of building a picker with nowhere to save to.

## Found while doing this work
On-device testing surfaced several real, non-obvious bugs that unit tests alone wouldn't have caught:
- **Two separate same-CSS-property Tailwind cascade conflicts** (`Card`'s padding via string-appended `className`, then independently `MonthPicker`'s `inset-x-auto` vs. `right-0`) — Tailwind's generated stylesheet order, not the order classes are written in JSX, decides which wins. The second one cost real back-and-forth before an empirical DOM dump (not just re-reading the source) found it.
- **`MonthBar` stretching to its parent's full width invisibly.** A `flex` container is still a block-level box (`width:auto` fills its parent) unless it's a flex *item* itself — true on Transactions (where it sat inside another flex row) but not Dashboard (a plain block wrapper), so the exact same component behaved differently depending on what wrapped it. Fixed with `inline-flex`; caught only because the popover's absolute position landed nowhere near the visible button.
- **A React key collision from an object `to` prop.** Once `?month=` turned `NavLink`'s `to` into `{ pathname, search }`, keying nav items by `item.to` collapsed Dashboard and Transactions onto the same `"[object Object]"` key, leaving a stale icon in the DOM after navigating to Categories. Fixed by keying on the always-unique `label` instead.
- **The sidebar was never `sticky`.** It only ever flowed with the page, so it looked fixed by accident on pages short enough to fit one screen and visibly scrolled away only once a page (Transactions) got tall enough to actually need scrolling — a bug that was invisible until the right page was tested.
- **The `toISOString()` UTC-conversion date bug reappeared independently.** `lib/date.js`'s `currentMonth()` already documented and avoided this exact failure mode; `TransactionForm.jsx` had its own separate `today()` that used the buggy pattern anyway. Fixed by centralising a `currentDate()` helper instead of leaving two implementations to drift.
- **My own regression test for that last bug shipped broken to CI.** It hardcoded an assertion (`toISOString()`'s exact output) that only holds in a timezone ahead of UTC — true on this dev machine (Asia/Singapore), false in CI (UTC, unset `TZ`). The *existing* `currentMonth` test in the same file already had the right pattern (document the old bug, never assert its output) and I didn't follow it. Caught by CI, not by local testing, since local testing was in the timezone where the bug happened to look correct.

## Carried into the backlog
- Bottom tab bar tap-target fix (#28) is shipped but not yet confirmed on-device to be the whole story.
- Dashboard chart type toggle (pie vs. bar) — new, unscheduled; needs a decision on whether it can stay CSS-only or means revisiting ADR0010's "no charting library" call.
- Everything Sprint 3 already had scoped (`docs/backlog.md`): Category colour/icon (now with a frontend-only stopgap in place to build on top of), Bundle A (transaction querying), Bundle B (dashboard visuals, partly pre-empted by ADR0013's Net card).

See `docs/backlog.md` for the full list and Sprint 3's plan.
