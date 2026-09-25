import { describe, it, expect } from 'vitest'
import { checkAmountInput, isFormDirty, toFormShape, toPayload } from '@features/transactions/utils/transactionForm'

describe('checkAmountInput', () => {
    it.each([
        ['12.34', 'ok'],
        ['', 'ok'],
        ['9999999999.99', 'ok'],
        ['12a', 'invalid'],
        ['-5', 'invalid'],
        ['1.2.3', 'invalid'],
        ['1.234', 'tooManyDecimals'],
        ['99999999999', 'overMax'],
    ])('classifies %j as %s', (value, expected) => {
        expect(checkAmountInput(value)).toBe(expected)
    })
})

describe('form shape round-trip', () => {
    const transaction = { type: 'INCOME', amount: 5, date: '2026-09-01', note: null, category: { id: 3 } }

    it('converts a transaction to string form fields and back to a payload', () => {
        const form = toFormShape(transaction)
        expect(form).toEqual({ type: 'INCOME', amount: '5', date: '2026-09-01', note: '', categoryId: '3' })
        expect(toPayload(form)).toEqual({ type: 'INCOME', amount: 5, date: '2026-09-01', note: null, categoryId: 3 })
    })

    it('detects dirtiness by value', () => {
        const form = toFormShape(transaction)
        expect(isFormDirty({ ...form }, form)).toBe(false)
        expect(isFormDirty({ ...form, note: 'x' }, form)).toBe(true)
    })
})
