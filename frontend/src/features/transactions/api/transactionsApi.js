import { api, unwrap } from '@api/httpClient'

// month: "YYYY-MM" (ADR0011), or undefined for the server's current month.
export function listTransactions(month) {
    return unwrap(api.get('/transactions', { params: month ? { month } : {} }))
}

// Every Draft (ADR0008) across all months, oldest first.
export function listDrafts() {
    return unwrap(api.get('/transactions/drafts'))
}

// payload: { type: "EXPENSE" | "INCOME", amount, date, note, categoryId }
export function createTransaction(payload) {
    return unwrap(api.post('/transactions', payload))
}

export function updateTransaction(id, payload) {
    return unwrap(api.put(`/transactions/${id}`, payload))
}

export function deleteTransaction(id) {
    return unwrap(api.delete(`/transactions/${id}`))
}
