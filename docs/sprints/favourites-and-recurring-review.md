# Favourites and Recurring Review

**Goal:** ship Favourites (Phase 1, ADR0017) and Recurring (Phase 2), brought forward ahead of Sprint 4, so the app can show how much of the month bills have already spoken for. Planned 2026-10-11; Phase 1 editing scope added 2026-10-18.

**Outcome: closed early by the Product Owner on 2026-11-14.** Phase 1 shipped. Phase 2 never started, because unplanned work kept being pulled in ahead of it. Recurring's goal is still valid, so it is carried over to a new sprint rather than dropped.

## Planned and shipped
- **Favourites (#46, 2026-11-08).**
  - Backend: `V6__favourites.sql` and `GET`/`POST`/`PUT`/`DELETE /api/favourites`. The Category delete guard also checks Favourites.
  - Frontend: the Favourites page, the picker in the Add transaction form, and the star on each Transaction.
  - Demo: mirrored in `demoApi.js`.
  - New ADR: 0017.
- **Recurring design (#48, 2026-11-11).** The remaining Recurring details were settled and recorded in the backlog: month-end clamping, first run, stopping, catch-up, and "Left to avoid spending". Planning only; nothing was built.

## Unplanned, pulled in after the sprint started
| PR | Date | What | How it came in |
|---|---|---|---|
| #47 | 2026-11-09 | Nav active state and page transitions | A polish pass slotted in "between" Phase 1 and Phase 2 |
| #49 | 2026-11-11 | Dialog motion and focus (inert background, scroll lock, Reduce Motion fades) | Follow-ups found while reviewing #47 |
| #50 | 2026-11-12 | Month bar tap target and loading; clear the cache when the User changes; route error screen | Follow-up from #47's review, plus bugs found while testing; the cache fix was a real data-privacy bug |
| #51 | 2026-11-14 | Field help behind (i) icons; no sign on zero amounts | A backlog item marked "idea only, not yet considered", plus a bug found during it |
| #52 | 2026-11-14 | Favourite detail as a bottom sheet on mobile | A pasted review report, built the same day |

Each started as a small, reasonable improvement, and each went straight to a branch instead of the backlog. Together they took the time Phase 2 needed.

## Not done
- Recurring (Phase 2): the clone action, ADR0018, the `CONTEXT.md` entry, and `feat/recurring`. Fully designed in `docs/backlog.md`; carried over.

## What went well
- **Shared building blocks kept the new UI consistent.** These are now shared instead of copied, which cut duplicated code:
  - the field label and help (`FieldLabel`, `useFieldHelp`);
  - the detail card (`DetailSheet`, `useDetailCard`).
- **Review reports were checked against the code before acting.** One report's claim that Favourites could be deleted with a single accidental tap was wrong: a confirm dialog already existed. A suspected password bug turned out to be Chrome's device emulation.
- **Decisions were recorded as they were made** in the backlog: help text length, the (i) being a Tab stop, "$0.00" for Drafts, and no "Use" button.

## What went wrong
- **Scope was never fixed.** Nothing stopped new work from replacing the planned work. The only one of the six that would justify a mid-sprint addition was #50's cache leak, which showed one User's data to the next User on the same tab.
- **The agent proposed unplanned items as "next"** (for example the Favourite sheet and a demo sidebar fix) instead of pointing back to the sprint plan.

## Process change
A new working rule in CLAUDE.md:
- Sprint scope is fixed once a sprint starts.
- New bugs, ideas and review findings go into `docs/backlog.md`, not onto a branch.
- "What's next" comes from the sprint plan.
- Only an urgent prod or User-data bug comes in mid-sprint, and it's called out as an exception.
- Only the Product Owner cancels or closes a sprint early.

## Carried into the backlog
- Recurring (Phase 2), with the clone action first.
- "Exit demo" starts off screen in the desktop sidebar in demo mode (found 2026-11-14).
- "Use" a Favourite from its page (deferred; contradicts ADR0017).
- The two editor hooks duplicate most of their logic.
- Form labels use two colours.
- The Note (i) is announced as "About Note (optional)".

Next: plan a new sprint, choosing between Recurring and the Sprint 4 Dashboard rework. See `docs/backlog.md`.
