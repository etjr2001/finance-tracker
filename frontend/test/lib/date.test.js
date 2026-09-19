import { describe, it, expect, vi, afterEach } from 'vitest'
import { currentMonth } from '../../src/lib/date'

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