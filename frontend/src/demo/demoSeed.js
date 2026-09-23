// Initial demo data: seeded once per browser (see demoApi.ensureSeeded), and
// restored by "Reset demo data". Dates are computed relative to `new Date()`
// rather than hardcoded, so the demo always looks current no matter when
// someone visits. No zero-amount (Draft) transactions are seeded — Drafts
// are meant to be demonstrated interactively, not baked into the baseline.

const CATEGORY_NAMES = [
    'Groceries',
    'Rent',
    'Dining Out',
    'Transport',
    'Utilities',
    'Entertainment',
    'Salary',
    'Freelance',
]

export function buildSeedCategories() {
    return CATEGORY_NAMES.map((name, i) => ({ id: i + 1, name }))
}

function pad(n) {
    return String(n).padStart(2, '0')
}

function ymd(year, monthIndex, day) {
    return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate()
}

// Never later than today, so seed data never looks future-dated.
function thisMonthDate(today, day) {
    const clampedDay = Math.min(day, today.getDate())
    return ymd(today.getFullYear(), today.getMonth(), clampedDay)
}

// Always falls in the calendar month before today's, regardless of that
// month's length.
function lastMonthDate(today, day) {
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const clampedDay = Math.min(day, daysInMonth(prev.getFullYear(), prev.getMonth()))
    return ymd(prev.getFullYear(), prev.getMonth(), clampedDay)
}

export function buildSeedTransactions(categories, today = new Date()) {
    const byName = Object.fromEntries(categories.map((c) => [c.name, c]))
    const cat = (name) => ({ id: byName[name].id, name: byName[name].name })

    const rows = [
        // this month
        { type: 'INCOME', amount: 4200.0, date: thisMonthDate(today, 1), note: null, category: cat('Salary') },
        { type: 'EXPENSE', amount: 1500.0, date: thisMonthDate(today, 1), note: null, category: cat('Rent') },
        { type: 'EXPENSE', amount: 82.4, date: thisMonthDate(today, 3), note: null, category: cat('Groceries') },
        { type: 'EXPENSE', amount: 34.5, date: thisMonthDate(today, 4), note: 'Team lunch', category: cat('Dining Out') },
        { type: 'EXPENSE', amount: 40.0, date: thisMonthDate(today, 5), note: null, category: cat('Transport') },
        { type: 'EXPENSE', amount: 120.75, date: thisMonthDate(today, 6), note: null, category: cat('Utilities') },
        { type: 'EXPENSE', amount: 15.99, date: thisMonthDate(today, 8), note: null, category: cat('Entertainment') },
        { type: 'EXPENSE', amount: 96.1, date: thisMonthDate(today, 10), note: null, category: cat('Groceries') },
        { type: 'EXPENSE', amount: 22.0, date: thisMonthDate(today, 12), note: null, category: cat('Dining Out') },
        { type: 'EXPENSE', amount: 18.5, date: thisMonthDate(today, 14), note: null, category: cat('Transport') },

        // last month
        { type: 'INCOME', amount: 650.0, date: lastMonthDate(today, 3), note: 'Logo design gig', category: cat('Freelance') },
        { type: 'EXPENSE', amount: 1500.0, date: lastMonthDate(today, 1), note: null, category: cat('Rent') },
        { type: 'EXPENSE', amount: 110.25, date: lastMonthDate(today, 5), note: null, category: cat('Groceries') },
        { type: 'EXPENSE', amount: 45.6, date: lastMonthDate(today, 20), note: null, category: cat('Groceries') },
        { type: 'EXPENSE', amount: 65.0, date: lastMonthDate(today, 8), note: null, category: cat('Dining Out') },
        { type: 'EXPENSE', amount: 18.75, date: lastMonthDate(today, 22), note: null, category: cat('Dining Out') },
        { type: 'EXPENSE', amount: 12.3, date: lastMonthDate(today, 15), note: null, category: cat('Transport') },
        { type: 'EXPENSE', amount: 88.2, date: lastMonthDate(today, 2), note: null, category: cat('Utilities') },
        { type: 'EXPENSE', amount: 59.99, date: lastMonthDate(today, 18), note: null, category: cat('Entertainment') },
    ]

    return rows.map((row, i) => ({ id: i + 1, ...row }))
}
