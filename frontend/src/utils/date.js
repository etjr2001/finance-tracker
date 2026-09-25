// All date helpers work in the browser's *local* calendar, never via
// toISOString(): that converts to UTC first, so near midnight it can report
// the wrong day/month for anyone not in UTC+0.
//
// Month/weekday names are hardcoded rather than toLocaleDateString(): the
// ambient locale isn't fixed and doesn't reliably produce these formats
// (e.g. en-SG gives "Wed, 23 Sept").

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTH_ABBR = MONTH_NAMES.map((name) => name.slice(0, 3))

export const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_RE = /^(\d{4})-(\d{2})$/

function pad2(value) {
    return String(value).padStart(2, '0')
}

// Date -> local "YYYY-MM" (defaults to now).
export function currentMonth(date = new Date()) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

// Date -> local "YYYY-MM-DD" (defaults to now).
export function currentDate(date = new Date()) {
    return `${currentMonth(date)}-${pad2(date.getDate())}`
}

// "YYYY-MM-DD" -> "YYYY-MM"
export function monthOf(dateString) {
    return dateString.slice(0, 7)
}

// "YYYY-MM-DD" -> Date at local midnight.
export function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

// Builds "YYYY-MM" from a year and a 0-based month index.
export function toMonthValue(year, monthIndex) {
    return `${year}-${pad2(monthIndex + 1)}`
}

// True only for a real "YYYY-MM" — rejects "2026-13", "2026-2", garbage,
// etc. (ADR0011: an invalid ?month= falls back to the current month.)
export function isValidMonth(value) {
    const match = MONTH_RE.exec(value)
    if (!match) return false
    const month = Number(match[2])
    return month >= 1 && month <= 12
}

// "YYYY-MM" -> "September 2026"
export function formatMonth(value) {
    const [year, month] = value.split('-').map(Number)
    return `${MONTH_NAMES[month - 1]} ${year}`
}

// "YYYY-MM" -> "YYYY-MM" shifted by `delta` months. The Date constructor
// normalizes out-of-range month indexes into the adjacent year for us.
export function shiftMonth(value, delta) {
    const [year, month] = value.split('-').map(Number)
    return currentMonth(new Date(year, month - 1 + delta, 1))
}

// "YYYY-MM" -> { startDate: "YYYY-MM-01", endDate: "YYYY-MM-<last>" }
export function monthBounds(value) {
    const [year, month] = value.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    return { startDate: `${value}-01`, endDate: `${value}-${pad2(lastDay)}` }
}
