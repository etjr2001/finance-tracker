# 0018. Recurring transactions posted on a schedule

## Status
Accepted, not yet built (Recurring sprint, 2026-11-15 → 2026-12-13)

## Context
ADR0017 split the old "template" idea in two: a Favourite is a manual shortcut, and Recurring is time-based (a monthly bill, a paycheck). Favourite shipped in #46. Recurring was settled in two grilling passes (2026-10-11 for the shape, 2026-11-11 for the details) and is recorded in `docs/backlog.md`. This ADR is where those rules live before any code is written.

The point of Recurring is to show how much of the month the User's bills have already spoken for. That only works if each run becomes a real Transaction on time, with the date it belongs to, even when the app was asleep or redeploying when the run was due.

Constraints that shape it:
- One deployable on Railway (ADR0001), so the scheduler runs inside the Spring Boot app, on a single replica.
- Supabase Postgres (ADR0005), with Flyway migrations.
- `/demo` has no backend (ADR0009), so it must reproduce the same posting in the browser.
- A Draft is a Transaction with amount zero (ADR0008).

## Decision

### What a Recurring item is
- **Its own table, not a flag on Favourite or Transaction** (ADR0017). It stores what a Favourite does (type, Category, amount, optional note) plus the schedule.
- **Amount varies → Drafts.** An item whose amount isn't known ahead posts Drafts (amount zero). ADR0008 is unchanged: these are ordinary Drafts that the User fills in later.
- **The Category delete guard covers it.** A Category used by a Recurring item can't be deleted, the same rule and in-use error as for Transactions and Favourites.

### Schedule
- **Frequency:** every N days, weeks, months or years.
- **Two anchors:** the date an entry is *posted* (created), and the date the posted Transaction *carries*. For example, posted on the 1st, dated the 21st. The Transaction date is never before the post date.
- **Month end clamps, always from the original anchors.** A date that doesn't exist in a month falls back to that month's last day: the 31st gives Feb 28/29, then Mar 31 again. A yearly Feb 29 gives Feb 28 in non-leap years. Each run is computed from the anchors and the run number, never by stepping on from the previous run, so dates never drift.
- **First run is today or later.** Nothing is ever posted into the past. "Make recurring" on a Transaction defaults to the next cycle after that Transaction's date. Backfilling earlier runs is done with Copy (#55).
- **Editing dates changes the next run, never one already posted.** The edit form shows the item's next entry ("posted 15 Dec, dated 21 Dec"), prefilled, and the User edits those two dates.
  - The new next post date must be today or later.
  - If the item has posted before, the new date must also fall in a **later cycle than the last posted run**. For monthly, a later calendar month (any day in it, so moving from the 15th to the 10th gives 10 Dec and no month is skipped). For weekly, a later week. For daily, a later day. For yearly, a later year. For "every N", N units on from the last posted run.
  - The schedule then re-anchors from the new next run. Transactions already posted are never changed.
  - Changing only the amount, note or Category affects future runs only.
  - Found 2026-11-15: re-anchoring straight from the new dates would forget which cycle was already posted. Moving the post date from the 15th to the 20th after November posted would post November twice. Changing only the Transaction date would re-post the current run at once, through posting on save.
- **Future-dated Transactions are intended.** A run posted on the 1st and dated the 21st is a real Transaction from the 1st onwards: it appears in the list and counts on the Dashboard. That's what "spoken for" means.

### Stopping
- **Stop** sets an end date. The item stays listed, showing "until" that date, and posts nothing after it.
- **Delete** removes the item. Transactions it already posted always stay; their link back to it is cleared (`transactions.recurring_id` is `ON DELETE SET NULL`).
- **No pause/resume in v1** (`docs/backlog.md`).

### Posting
- **Three triggers, one posting path.** Due runs are posted by:
  - a scheduled job in the same app (`@Scheduled`);
  - a catch-up run at startup, so runs missed while the app slept or redeployed are posted with their correct dates;
  - saving an item (create or edit), so a run due today appears straight away instead of at the next tick.

  All three call the same posting code.
- **Every missed run is posted,** capped at **366 runs per item per pass.** Anything past the cap is logged and posted on the next pass.
- **Only posting links a Transaction to a Recurring item** (`recurring_id`). Creating a Transaction by hand never sets it.
- **A row lock stops double-posting.** During a Railway deploy the new instance starts before the old one stops, so two copies briefly run at once: one instance's startup catch-up can overlap the other's scheduled tick, or a save.
  - The posting code takes each due item with `SELECT … FOR UPDATE SKIP LOCKED`.
  - It inserts that item's Transactions and moves the item on to its next run in **one database transaction**.
  - A second instance skips an item that's locked. If it reaches the item after the first commits, it reads the advanced next run and finds nothing due.
- **One app-wide timezone, `Asia/Singapore`** (`app.timezone`), decides when "today" starts and when the job runs. It matches today's only Currency (SGD). A per-User timezone is in the backlog.

### "Left to avoid spending"
Shown next to the Drafts notice as "Left to avoid spending: $X + N unknown":
- Current month only; hidden when viewing another month.
- Expenses only.
- **$X** is the total of Recurring Expenses dated after today this month, whether already posted or not.
- **N** counts varying-amount items with a run still to come this month.

### UI
- **A Recurring page,** the fifth nav item after Favourites. Check that the bottom tab bar still fits on a phone.
- **Created from scratch or with "Make recurring"** on a Transaction, which prefills the form.

### Demo
- **Posting is mirrored** in `demoApi.js` through one shared JS schedule util, per ADR0009. The util is tested against the same cases as the Java schedule tests, so both clamp and count runs identically. Saving an item posts its due runs straight away, as on the server.
- **The demo seed includes Recurring items with history,** e.g. rent and salary that "started" a few months before the demo loads. Their past runs are generated by the same util, relative to the load date, and Reset demo data regenerates them. A visitor sees past runs in earlier months, one dated later this month, and "Left to avoid spending", without creating anything or waiting. This doesn't break "never posts into the past": that rule limits what a User can create, and the seed only stands in for a job that has been running all along.

## Alternatives considered
- **Merging Recurring into Favourite.** Rejected in ADR0017.
- **Skipping a run when its day doesn't exist in the month** (no Feb 31 → no February entry). Rejected: a monthly bill still has to be paid in February, and a missing entry would understate what's spoken for.
- **Stepping each run on from the previous one.** Rejected: once a 31st clamps to the 28th, every later month would land on the 28th. Computing from the original anchors avoids that drift.
- **Allowing a start date in the past (back-posting).** Rejected: it would create a burst of Transactions on save and blur "what the job did" with "what the User entered". Copy covers backfilling.
- **Pause/resume.** Left out of v1. Stop and Delete cover it for now. If it's built, it has to decide whether resuming posts the runs missed while paused.
- **Demo without posting** (show the items, never create Transactions). Rejected: the demo would no longer show what Recurring is for, and ADR0009 has the demo mirror real behaviour.
- **Posting only from the job.** Rejected: one fewer code path, but a run due today would appear only at the next tick, so saving would look as if it did nothing.
- **A version column (optimistic locking) instead of, or as well as, the row lock.** Rejected: on its own it catches a double post only by failing and rolling back, which is noisier. Next to the row lock it could never fire, so it would be dead code that still needs tests.
- **One advisory lock per pass** (`pg_try_advisory_xact_lock`). Rejected: it makes the whole pass one long transaction, where one bad item rolls back everyone's posts. Posting on save would also have to remember to take the same lock, whereas a row lock protects the item wherever it's posted from.
- **Re-anchoring straight from the edited dates.** Rejected: it can post a cycle twice (see Schedule).
- **No date edits** (Stop and create a new item instead). Rejected: more taps, and the posted history would be split across two items.
- **Allowing a same-cycle re-post with a warning.** Rejected: a double entry would still be one tap away, and money data shouldn't depend on the User reading a warning.
- **A unique key on the posted Transactions** (e.g. `recurring_id` plus run number). Rejected: re-anchoring after an edit restarts the run count, so a legitimate run after an edit could collide with an earlier one. The later-cycle rule above already stops the same cycle being posted twice by an edit.

## Consequences
- The Transactions list and the Dashboard can show Transactions dated later this month. Anything that assumes "no Transaction is after today" must not.
- Recurring copies Favourite's columns (type, Category, amount, note). Accepted, as in ADR0017.
- The row lock also holds if Railway ever runs more than one replica, since the guarantee comes from the database, not from there being one instance. Each item's lock is held while its runs post; the 366-run cap keeps that transaction short.
- Any new code path that posts runs must go through the same locked posting code.
- Schedule maths lives twice, in Java and in JS. Keeping one shared set of test cases is what stops them drifting.
- Deleting a Recurring item never removes money already recorded, so a User's history is unaffected.
- When Currency is built (`CONTEXT.md`), Recurring's amount needs the same widening as Transaction's and Favourite's.
