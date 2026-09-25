// Same function names/signatures as api/transactions.js, api/categories.js,
// and api/dashboard.js, backed by localStorage instead of the network. Every
// hook branches between this module and the real one, so the shapes here
// must match the real API's responses exactly. See ADR0009.
import { KEYS, readJSON, writeJSON, removeAll } from '@features/demo/utils/demoStorage'
import { buildSeedCategories, buildSeedTransactions } from '@features/demo/utils/demoSeed'
import { roundHalfEven } from '@features/demo/utils/demoMoney'
import { currentMonth, monthBounds } from '@utils/date'

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

export async function createCategory({ name, colorKey = null, iconKey = null }) {
    const categories = readJSON(KEYS.categories, [])
    const id = readJSON(KEYS.nextCategoryId, 1)
    const created = { id, name, colorKey, iconKey }
    writeJSON(KEYS.categories, [...categories, created])
    writeJSON(KEYS.nextCategoryId, id + 1)
    return created
}

export async function updateCategory(id, { name, colorKey = null, iconKey = null }) {
    const categories = readJSON(KEYS.categories, [])
    const updated = categories.map((c) => (c.id === id ? { ...c, name, colorKey, iconKey } : c))
    writeJSON(KEYS.categories, updated)

    // The real API embeds the full Category on each Transaction too, so a
    // rename/recolour must be reflected on every Transaction referencing it.
    const transactions = readJSON(KEYS.transactions, [])
    writeJSON(
        KEYS.transactions,
        transactions.map((t) =>
            t.category?.id === id ? { ...t, category: { ...t.category, name, colorKey, iconKey } } : t
        )
    )

    return updated.find((c) => c.id === id)
}

export async function deleteCategory(id) {
    const categories = readJSON(KEYS.categories, [])
    const transactions = readJSON(KEYS.transactions, [])
    const isInUse = transactions.some((t) => t.category?.id === id)
    if (isInUse) {
        const category = categories.find((c) => c.id === id)
        throw new Error(`Cannot delete category '${category?.name ?? ''}' - it has existing transactions.`)
    }
    writeJSON(KEYS.categories, categories.filter((c) => c.id !== id))
}

// --- transactions ---

export async function listTransactions() {
    return readJSON(KEYS.transactions, [])
}

function resolveCategory(categoryId) {
    const categories = readJSON(KEYS.categories, [])
    const category = categories.find((c) => c.id === categoryId)
    return category ? { id: category.id, name: category.name, colorKey: category.colorKey, iconKey: category.iconKey } : null
}

// Same shape the real API returns for a Transaction.
function toTransactionRecord(id, payload) {
    return {
        id,
        type: payload.type,
        amount: payload.amount,
        date: payload.date,
        note: payload.note ?? null,
        category: resolveCategory(payload.categoryId),
    }
}

export async function createTransaction(payload) {
    const transactions = readJSON(KEYS.transactions, [])
    const id = readJSON(KEYS.nextTransactionId, 1)
    const created = toTransactionRecord(id, payload)
    writeJSON(KEYS.transactions, [...transactions, created])
    writeJSON(KEYS.nextTransactionId, id + 1)
    return created
}

export async function updateTransaction(id, payload) {
    const transactions = readJSON(KEYS.transactions, [])
    const updated = transactions.map((t) => (t.id === id ? toTransactionRecord(id, payload) : t))
    writeJSON(KEYS.transactions, updated)
    return updated.find((t) => t.id === id)
}

export async function deleteTransaction(id) {
    const transactions = readJSON(KEYS.transactions, [])
    writeJSON(KEYS.transactions, transactions.filter((t) => t.id !== id))
}

// --- dashboard ---

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
    const { startDate, endDate } = monthBounds(period)
    const transactions = readJSON(KEYS.transactions, [])
    const inRange = transactions.filter((t) => t.date >= startDate && t.date <= endDate)

    const totalIncome = sumByType(inRange, 'INCOME')
    const totalExpenses = sumByType(inRange, 'EXPENSE')
    const net = roundHalfEven(totalIncome - totalExpenses)
    const byCategory = buildCategoryBreakdown(inRange)

    return { periodStartDate: startDate, periodEndDate: endDate, totalIncome, totalExpenses, net, byCategory }
}
