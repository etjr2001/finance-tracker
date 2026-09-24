// Groups a transaction list into day sections for the day-grouped
// Transactions list (ADR0010: "Today", "Yesterday", then e.g. "Tue 22
// Sep", each with a day total). The caller sorts (newest first); this
// only groups consecutive same-date entries, so it trusts that order.

function toDateString(date) {
    // Local calendar date, not toISOString() (which converts to UTC first
    // and can land on the wrong day near midnight outside UTC+0 — see the
    // same note in lib/date.js).
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

// Built by hand rather than toLocaleDateString(undefined, ...): the
// ambient locale isn't fixed (same reasoning as lib/money.js), and it
// doesn't reliably give "Wed 23 Sep" — e.g. under en-SG it comes out as
// "Wed, 23 Sept" (comma, 4-letter month, different word order).
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// { relative: 'Today' | 'Yesterday' | null, formatted: 'Wed 23 Sep' }
export function dayGroupLabel(dateString, today = new Date()) {
    const todayStr = toDateString(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = toDateString(yesterday)

    let relative = null
    if (dateString === todayStr) relative = 'Today'
    else if (dateString === yesterdayStr) relative = 'Yesterday'

    const date = parseLocalDate(dateString)
    const formatted = `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`

    return { relative, formatted }
}

// [{ date, label: {relative, formatted}, total, transactions }], preserving
// input order. `total` is signed (income positive, expense negative) —
// Drafts (amount 0) contribute 0 regardless of type.
export function groupByDay(transactions, today = new Date()) {
    const groups = []
    let current = null

    for (const t of transactions) {
        if (!current || current.date !== t.date) {
            current = {
                date: t.date,
                label: dayGroupLabel(t.date, today),
                total: 0,
                transactions: [],
            }
            groups.push(current)
        }
        current.transactions.push(t)
        current.total += t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)
    }

    return groups
}
