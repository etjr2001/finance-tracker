import { api, unwrap } from '@api/httpClient'

export function listTransactions() {
    return unwrap(api.get('/transactions'))
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
