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