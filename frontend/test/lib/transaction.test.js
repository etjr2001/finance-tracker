import { describe, it, expect } from 'vitest'
import {
    describeTransaction,
    isDraft,
    signedAmount,
    categoryNameOf,
} from '@features/transactions/utils/transaction'

const expense = { id: 1, type: 'EXPENSE', amount: 12.5, date: '2026-09-01', note: 'Weekly shop', category: { id: 1, name: 'Groceries' } }

describe('transaction helpers', () => {
    it('signs income positive and expenses negative', () => {
        expect(signedAmount(expense)).toBe(-12.5)
        expect(signedAmount({ ...expense, type: 'INCOME' })).toBe(12.5)
    })

    it('treats a zero amount (number or string) as a Draft', () => {
        expect(isDraft({ ...expense, amount: 0 })).toBe(true)
        expect(isDraft({ ...expense, amount: '0' })).toBe(true)
        expect(isDraft(expense)).toBe(false)
    })

    it('describes a transaction for the delete confirmation', () => {
        expect(describeTransaction(expense)).toBe('Groceries — Weekly shop')
        expect(describeTransaction({ ...expense, note: null })).toBe('Groceries')
        expect(describeTransaction({ ...expense, note: null, category: null })).toBe('this transaction')
    })

    it('falls back to a placeholder category name', () => {
        expect(categoryNameOf({ ...expense, category: null })).toBe('Unknown category')
    })
})
