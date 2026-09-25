// Thin localStorage wrapper for demo-mode state. Namespaced under `demo:` so
// it can never collide with anything else the app stores (nothing else uses
// localStorage directly today).
export const KEYS = {
    transactions: 'demo:transactions',
    categories: 'demo:categories',
    nextTransactionId: 'demo:nextTransactionId',
    nextCategoryId: 'demo:nextCategoryId',
    seeded: 'demo:seeded',
}

export function readJSON(key, fallback) {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    try {
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

export function writeJSON(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeAll() {
    Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key))
}
