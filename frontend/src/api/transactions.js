import { api } from './client'

export function listTransactions() {
    return api.get('/transactions').then((res) => res.data)
}

export function createTransaction(payload) {
    // payload: { type: "EXPENSE" | "INCOME", amount, date, note, categoryId }
    return api.post('/transactions', payload).then((res) => res.data)
}

export function updateTransaction(id, payload) {
    return api.put(`/transactions/${id}`, payload).then((res) => res.data)
}

export function deleteTransaction(id) {
    return api.delete(`/transactions/${id}`).then((res) => res.data)
}