import { UNKNOWN_CATEGORY_NAME } from '@features/categories/utils/categoryName'

export const TRANSACTION_TYPES = {
    EXPENSE: 'EXPENSE',
    INCOME: 'INCOME',
}

export function isIncome(transaction) {
    return transaction.type === TRANSACTION_TYPES.INCOME
}

// A Draft is a Transaction whose amount isn't known yet (ADR0008).
export function isDraft(transaction) {
    return Number(transaction.amount) === 0
}

// Income positive, Expense negative. Drafts contribute 0 either way.
export function signedAmount(transaction) {
    const amount = Number(transaction.amount)
    return isIncome(transaction) ? amount : -amount
}

export function categoryNameOf(transaction) {
    return transaction.category?.name ?? UNKNOWN_CATEGORY_NAME
}

// Human description used in the delete confirmation.
export function describeTransaction(transaction) {
    const categoryName = transaction.category?.name
    if (transaction.note) return `${categoryName ?? 'transaction'} — ${transaction.note}`
    return categoryName ?? 'this transaction'
}
