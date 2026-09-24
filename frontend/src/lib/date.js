// Returns the local "YYYY-MM" for the given date (defaults to now).
//
// Deliberately uses getFullYear()/getMonth() instead of
// date.toISOString().slice(0, 7): toISOString() always converts to UTC
// first, so near a month boundary it can report the wrong month for
// anyone not in UTC+0 (e.g. right after midnight in a timezone ahead of
// UTC, toISOString() still reflects the previous UTC day).
export function currentMonth(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
}

const MONTH_RE = /^(\d{4})-(\d{2})$/

// True only for a real "YYYY-MM" — rejects "2026-13", "2026-2", garbage,
// etc. (ADR0011: an invalid ?month= falls back to the current month.)
export function isValidMonth(value) {
    const match = MONTH_RE.exec(value)
    if (!match) return false
    const month = Number(match[2])
    return month >= 1 && month <= 12
}

// "YYYY-MM" -> "September 2026". Built by hand, not toLocaleDateString —
// same reasoning as lib/money.js and lib/dayGroups.js: the ambient locale
// isn't fixed and doesn't reliably give this exact format.
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTH_ABBR = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatMonth(value) {
    const [year, month] = value.split('-').map(Number)
    return `${MONTH_NAMES[month - 1]} ${year}`
}

// Returns the local "YYYY-MM-DD" for the given date (defaults to now). Same
// UTC-conversion pitfall and fix as currentMonth above — reuses it for the
// year/month, so there's one place this logic lives, not two.
export function currentDate(date = new Date()) {
    const day = String(date.getDate()).padStart(2, '0')
    return `${currentMonth(date)}-${day}`
}

// "YYYY-MM" -> "YYYY-MM" one month earlier/later, wrapping the year.
export function shiftMonth(value, delta) {
    const [year, month] = value.split('-').map(Number)
    // Date's month is 0-indexed; (month - 1 + delta) can go negative or
    // past 11, and the Date constructor normalizes that into the correct
    // adjacent year for us.
    const shifted = new Date(year, month - 1 + delta, 1)
    return currentMonth(shifted)
}