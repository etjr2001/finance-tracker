import { describe, it, expect, vi, afterEach } from 'vitest'
import { currentMonth, currentDate, isValidMonth, formatMonth, shiftMonth } from '@utils/date'

describe('currentMonth', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns the year and month for a given local date', () => {
        expect(currentMonth(new Date(2026, 0, 5))).toBe('2026-01') // Jan 5
    })

    it('pads single-digit months with a leading zero', () => {
        expect(currentMonth(new Date(2026, 8, 15))).toBe('2026-09') // Sep 15
    })

    it('defaults to the current system date when called with no argument', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 3)) // Mar 3
        expect(currentMonth()).toBe('2026-03')
    })

    it('reads the month from local date parts, not a UTC conversion', () => {
        // Regression guard for the original bug: `date.toISOString().slice(0, 7)`
        // converts to UTC before slicing, so right after local midnight on the
        // 1st of a month, in any timezone ahead of UTC, it can still report
        // the previous month. getFullYear()/getMonth() read local wall-clock
        // time directly and don't have this failure mode.
        const justAfterLocalMidnight = new Date(2026, 8, 1, 0, 30) // Sep 1, 00:30 local
        expect(currentMonth(justAfterLocalMidnight)).toBe('2026-09')

        const oldBuggyImplementation = (date) => date.toISOString().slice(0, 7)
        // Only actually differs from the fix when the test runner's local
        // timezone is ahead of UTC (e.g. run with TZ=Asia/Singapore) — left
        // here as documentation of the exact bug this replaces, not asserted
        // against, since CI commonly defaults to UTC where the two coincide.
        void oldBuggyImplementation
    })
})

describe('currentDate', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns the local YYYY-MM-DD for a given date', () => {
        expect(currentDate(new Date(2026, 8, 5))).toBe('2026-09-05') // Sep 5
    })

    it('pads single-digit days with a leading zero', () => {
        expect(currentDate(new Date(2026, 8, 1))).toBe('2026-09-01') // Sep 1
    })

    it('defaults to the current system date when called with no argument', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 2, 3)) // Mar 3
        expect(currentDate()).toBe('2026-03-03')
    })

    // Regression guard for the exact bug TransactionForm.jsx's own `today()`
    // had: date.toISOString().slice(0, 10) converts to UTC first, so at
    // 1am in a timezone ahead of UTC (this suite runs in Asia/Singapore,
    // UTC+8) it still reports the previous UTC day — "yesterday" appearing
    // as today's date on a new transaction. getFullYear()/getMonth()/
    // getDate() read local wall-clock time directly and don't have this
    // failure mode.
    it('reads the date from local date parts, not a UTC conversion', () => {
        const oneAmLocal = new Date(2026, 8, 24, 1, 0) // Sep 24, 01:00 local
        expect(currentDate(oneAmLocal)).toBe('2026-09-24')

        const oldBuggyImplementation = (date) => date.toISOString().slice(0, 10)
        // Only actually differs from the fix when the test runner's local
        // timezone is ahead of UTC (e.g. run with TZ=Asia/Singapore) — left
        // here as documentation of the exact bug this replaces, not
        // asserted against, since CI defaults to UTC where the two
        // coincide (same reasoning as the currentMonth test above).
        void oldBuggyImplementation
    })
})

describe('isValidMonth', () => {
    it('accepts a real YYYY-MM', () => {
        expect(isValidMonth('2026-09')).toBe(true)
    })

    it('rejects a month over 12', () => {
        expect(isValidMonth('2026-13')).toBe(false)
    })

    it('rejects a month of 00', () => {
        expect(isValidMonth('2026-00')).toBe(false)
    })

    it('rejects a single-digit month with no leading zero', () => {
        expect(isValidMonth('2026-9')).toBe(false)
    })

    it('rejects garbage', () => {
        expect(isValidMonth('not-a-month')).toBe(false)
    })

    it('rejects null/undefined', () => {
        expect(isValidMonth(null)).toBe(false)
        expect(isValidMonth(undefined)).toBe(false)
    })
})

describe('formatMonth', () => {
    it('formats a YYYY-MM as "Month YYYY"', () => {
        expect(formatMonth('2026-09')).toBe('September 2026')
    })

    it('formats January correctly (no off-by-one on the 0-indexed lookup)', () => {
        expect(formatMonth('2026-01')).toBe('January 2026')
    })

    it('formats December correctly', () => {
        expect(formatMonth('2026-12')).toBe('December 2026')
    })
})

describe('shiftMonth', () => {
    it('moves forward one month', () => {
        expect(shiftMonth('2026-09', 1)).toBe('2026-10')
    })

    it('moves backward one month', () => {
        expect(shiftMonth('2026-09', -1)).toBe('2026-08')
    })

    it('wraps forward across a year boundary', () => {
        expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    })

    it('wraps backward across a year boundary', () => {
        expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    })

    it('supports jumping by a year (delta of 12)', () => {
        expect(shiftMonth('2026-09', 12)).toBe('2027-09')
    })
})

describe('monthBounds / monthOf / toMonthValue', async () => {
    const { monthBounds, monthOf, toMonthValue } = await import('@utils/date')

    it('gives the first and last day of a month, including leap Februaries', () => {
        expect(monthBounds('2026-09')).toEqual({ startDate: '2026-09-01', endDate: '2026-09-30' })
        expect(monthBounds('2024-02')).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29' })
    })

    it('extracts the month of a date string', () => {
        expect(monthOf('2026-11-05')).toBe('2026-11')
    })

    it('builds a zero-padded month value from a 0-based index', () => {
        expect(toMonthValue(2026, 0)).toBe('2026-01')
        expect(toMonthValue(2026, 11)).toBe('2026-12')
    })
})
