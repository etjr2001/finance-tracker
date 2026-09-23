// Same function names/signatures as api/transactions.js, api/categories.js,
// and api/dashboard.js, backed by localStorage instead of the network. Every
// hook branches between this module and the real one, so the shapes here
// must match the real API's responses exactly. See ADR0009.
import { KEYS, readJSON, writeJSON, removeAll } from './demoStorage'
import { buildSeedCategories, buildSeedTransactions } from './demoSeed'
import { roundHalfEven } from './demoMoney'
import { currentMonth } from '../lib/date'

// --- seeding ---

export function ensureSeeded() {
    if (readJSON(KEYS.seeded, false)) return
    const categories = buildSeedCategories()
    const transactions = buildSeedTransactions(categories)
    writeJSON(KEYS.categories, categories)
    writeJSON(KEYS.transactions, transactions)
    writeJSON(KEYS.nextCategoryId, categories.length + 1)
    writeJSON(KEYS.nextTransactionId, transactions.length + 1)
    writeJSON(KEYS.seeded, true)
}

export function resetDemoData() {
    removeAll()
    ensureSeeded()
}

// --- categories ---

export async function listCategories() {
    return readJSON(KEYS.categories, [])
}

export async function createCategory({ name }) {
    const categories = readJSON(KEYS.categories, [])
    const id = readJSON(KEYS.nextCategoryId, 1)
    const created = { id, name }
    writeJSON(KEYS.categories, [...categories, created])
    writeJSON(KEYS.nextCategoryId, id + 1)
    return created
}

export async function updateCategory(id, { name }) {
    const categories = readJSON(KEYS.categories, [])
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c))
    writeJSON(KEYS.categories, updated)

    // The real API stores the category name on each Transaction too, so
    // renaming must be reflected on every Transaction referencing it.
    const transactions = readJSON(KEYS.transactions, [])
    writeJSON(
        KEYS.transactions,
        transactions.map((t) => (t.category?.id === id ? { ...t, category: { ...t.category, name } } : t))
    )

    return updated.find((c) => c.id === id)
}

export async function deleteCategory(id) {
    const transactions = readJSON(KEYS.transactions, [])
    const category = readJSON(KEYS.categories, []).find((c) => c.id === id)
    const inUse = transactions.some((t) => t.category?.id === id)
    if (inUse) {
        throw new Error(`Cannot delete category '${category?.name ?? ''}' - it has existing transactions.`)
    }
    const categories = readJSON(KEYS.categories, [])
    writeJSON(KEYS.categories, categories.filter((c) => c.id !== id))
}

// --- transactions ---

export async function listTransactions() {
    return readJSON(KEYS.transactions, [])
}

function resolveCategory(categoryId) {
    const categories = readJSON(KEYS.categories, [])
    const category = categories.find((c) => c.id === categoryId)
    return category ? { id: category.id, name: category.name } : null
}

export async function createTransaction(payload) {
    const transactions = readJSON(KEYS.transactions, [])
    const id = readJSON(KEYS.nextTransactionId, 1)
    const created = {
        id,
        type: payload.type,
        amount: payload.amount,
        date: payload.date,
        note: payload.note ?? null,
        category: resolveCategory(payload.categoryId),
    }
    writeJSON(KEYS.transactions, [...transactions, created])
    writeJSON(KEYS.nextTransactionId, id + 1)
    return created
}

export async function updateTransaction(id, payload) {
    const transactions = readJSON(KEYS.transactions, [])
    const updated = transactions.map((t) =>
        t.id === id
            ? {
                  ...t,
                  type: payload.type,
                  amount: payload.amount,
                  date: payload.date,
                  note: payload.note ?? null,
                  category: resolveCategory(payload.categoryId),
              }
            : t
    )
    writeJSON(KEYS.transactions, updated)
    return updated.find((t) => t.id === id)
}

export async function deleteTransaction(id) {
    const transactions = readJSON(KEYS.transactions, [])
    writeJSON(KEYS.transactions, transactions.filter((t) => t.id !== id))
}

// --- dashboard ---

function lastDayOfMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate()
}

function periodBounds(period) {
    const [year, month] = period.split('-').map(Number)
    const monthIndex = month - 1
    const startDate = `${period}-01`
    const endDate = `${period}-${String(lastDayOfMonth(year, monthIndex)).padStart(2, '0')}`
    return { startDate, endDate }
}

function sumByType(transactions, type) {
    const total = transactions
        .filter((t) => t.type === type)
        .reduce((acc, t) => acc + t.amount, 0)
    return roundHalfEven(total)
}

// Mirrors DashboardService.buildCategoryBreakdown, with one deliberate
// divergence from today's real backend: zero-amount (Draft) transactions are
// excluded here, per ADR0008's intended behavior. The real backend does not
// yet do this (tracked in docs/backlog.md) — see ADR0009's Consequences.
function buildCategoryBreakdown(transactions) {
    const groups = new Map()
    for (const t of transactions) {
        if (t.type !== 'EXPENSE') continue
        if (t.amount === 0) continue
        if (!t.category) continue
        const key = t.category.id
        const existing = groups.get(key) ?? { categoryId: key, categoryName: t.category.name, total: 0 }
        existing.total = roundHalfEven(existing.total + t.amount)
        groups.set(key, existing)
    }
    return [...groups.values()].sort((a, b) => b.total - a.total)
}

export async function getDashboard(month) {
    const period = month ?? currentMonth()
    const { startDate, endDate } = periodBounds(period)
    const transactions = readJSON(KEYS.transactions, [])
    const inRange = transactions.filter((t) => t.date >= startDate && t.date <= endDate)

    const totalIncome = sumByType(inRange, 'INCOME')
    const totalExpenses = sumByType(inRange, 'EXPENSE')
    const net = roundHalfEven(totalIncome - totalExpenses)
    const byCategory = buildCategoryBreakdown(inRange)

    return { periodStartDate: startDate, periodEndDate: endDate, totalIncome, totalExpenses, net, byCategory }
}
