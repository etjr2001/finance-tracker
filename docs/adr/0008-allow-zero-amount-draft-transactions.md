# 0008. Allow zero-amount Draft transactions

## Status
Accepted

## Context
Sprint 1 intended to rule out zero-amount and partial transactions: the Sprint 1 review records "Draft/partial transactions, $0 transactions — ruled out; `@DecimalMin("0.01")` enforced."

The code did not stay that way. Commit `2319f4d` (2026-09-13, a sprint 1 validation bug-fix commit) changed the rule to "zero allowed, negative rejected" (`@PositiveOrZero` on `Transaction.amount`, `@DecimalMin("0")` on the request). Sprint 2 Branch 1 then gave zero-amount transactions a meaning: they show a "Draft" badge, and the form tells the user a zero amount "will show as a Draft."

So the Sprint 1 decision was reversed in practice without being recorded, and the reversal was only discovered while moving the project docs into the repo. This ADR records the reversal and what it means.

The real use case is logging a money movement before its amount is known (for example, a bill that has arrived but whose final amount isn't settled yet), so the user doesn't have to hold it in their head.

## Decision
A Transaction may have an amount of zero. A zero-amount Transaction is a **Draft** (see `CONTEXT.md`): a placeholder whose amount isn't known yet. Negative amounts remain invalid; direction is carried by Expense/Income, never by sign.

A Draft is still a full Transaction: it must be an Expense or Income, have a date and a Category, and belong to one User. There is no separate status field. "Draft" is derived from `amount == 0`, not stored.

Drafts are excluded from the Dashboard's Category breakdown.

Zero is not used for genuinely zero-value movements (such as a waived fee). Those are simply not recorded.

## Consequences
- Users can capture a transaction before its amount is known, which was the motivation.
- Zero-amount rows already exist in prod, so reversing this later means deciding what to do with existing Drafts (delete them, or force the user to fill them in). That's why this gets an ADR.
- Because Draft is derived from the amount, there is no way to mark a Draft "done" without giving it a non-zero amount, and no way to represent a real zero-value movement. If either is ever needed, Draft becomes a stored status, which would supersede this ADR.
- Dashboard totals are unaffected (zero adds nothing), but the Category breakdown currently still lists Categories that contain only Drafts as `$0.00` rows. Excluding them is tracked in `docs/backlog.md`.
- The Sprint 1 review is left as written, with a correction note pointing here.
