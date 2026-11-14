import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SignedAmount } from '@features/transactions/components/SignedAmount'

function textOf(transaction) {
    const { container } = render(<SignedAmount transaction={transaction} />)
    return container.textContent
}

describe('SignedAmount', () => {
    it('signs an expense with U+2212', () => {
        expect(textOf({ type: 'EXPENSE', amount: 12 })).toBe('−$12.00')
    })

    it('signs income with +', () => {
        expect(textOf({ type: 'INCOME', amount: 12 })).toBe('+$12.00')
    })

    it('shows no sign on a zero expense (a Draft)', () => {
        expect(textOf({ type: 'EXPENSE', amount: 0 })).toBe('$0.00')
    })

    it('shows no sign on a zero income (a Draft)', () => {
        expect(textOf({ type: 'INCOME', amount: 0 })).toBe('$0.00')
    })

    it('treats a string zero from the API as zero', () => {
        expect(textOf({ type: 'EXPENSE', amount: '0.00' })).toBe('$0.00')
    })
})
