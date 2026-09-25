import { MONTH_ABBR, WEEKDAY_ABBR, currentDate, parseLocalDate } from '@utils/date'
import { signedAmount } from '@features/transactions/utils/transaction'

// { relative: 'Today' | 'Yesterday' | null, formatted: 'Wed 23 Sep' }
export function dayGroupLabel(dateString, today = new Date()) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let relative = null
    if (dateString === currentDate(today)) relative = 'Today'
    else if (dateString === currentDate(yesterday)) relative = 'Yesterday'

    const date = parseLocalDate(dateString)
    const formatted = `${WEEKDAY_ABBR[date.getDay()]} ${date.getDate()} ${MONTH_ABBR[date.getMonth()]}`

    return { relative, formatted }
}

// Groups an already-sorted (newest first) list into day sections for the
// Transactions list (ADR0010): [{ date, label, total, transactions }].
// Only consecutive same-date entries are grouped, so input order is trusted.
// `total` is signed (income positive, expense negative).
export function groupByDay(transactions, today = new Date()) {
    const groups = []
    let current = null

    for (const transaction of transactions) {
        if (current?.date !== transaction.date) {
            current = {
                date: transaction.date,
                label: dayGroupLabel(transaction.date, today),
                total: 0,
                transactions: [],
            }
            groups.push(current)
        }
        current.transactions.push(transaction)
        current.total += signedAmount(transaction)
    }

    return groups
}
