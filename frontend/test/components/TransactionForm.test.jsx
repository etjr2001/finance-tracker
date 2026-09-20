import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransactionForm from '../../src/components/TransactionForm'

const categories = [{ id: 1, name: 'Groceries' }]

describe('TransactionForm date picker', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens the native date picker on click anywhere in the field', async () => {
        const showPicker = vi.fn()
        HTMLInputElement.prototype.showPicker = showPicker

        const user = userEvent.setup()
        const { container } = render(
            <TransactionForm categories={categories} onSubmit={() => {}} />
        )

        const dateInput = container.querySelector('input[type="date"]')
        await user.click(dateInput)

        expect(showPicker).toHaveBeenCalledTimes(1)
    })

    it('does not throw in browsers without showPicker support', async () => {
        // Older/unsupported browsers simply don't have the method — the
        // `e.target.showPicker?.()` optional chaining is what this guards.
        delete HTMLInputElement.prototype.showPicker

        const user = userEvent.setup()
        const { container } = render(
            <TransactionForm categories={categories} onSubmit={() => {}} />
        )

        const dateInput = container.querySelector('input[type="date"]')
        await expect(user.click(dateInput)).resolves.not.toThrow()
    })
})

describe('TransactionForm draft hint', () => {
    it('shows the Draft hint by default for a new transaction (defaults to $0)', () => {
        render(<TransactionForm categories={categories} onSubmit={() => {}} />)
        expect(screen.getByText('Will show as a Draft (0 amount)')).toBeInTheDocument()
    })

    it('shows no hint when editing an existing non-zero transaction', () => {
        const initial = {
            id: 1,
            type: 'EXPENSE',
            amount: 12.5,
            date: '2026-09-01',
            note: '',
            category: { id: 1, name: 'Groceries' },
        }
        render(<TransactionForm categories={categories} initial={initial} onSubmit={() => {}} />)
        expect(screen.queryByText(/Will show as a Draft/)).not.toBeInTheDocument()
    })

    it('hides the Draft hint once a non-zero amount is entered', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <TransactionForm categories={categories} onSubmit={() => {}} />
        )

        expect(screen.getByText('Will show as a Draft (0 amount)')).toBeInTheDocument()

        const amountInput = container.querySelector('input[type="number"]')
        await user.type(amountInput, '.01')

        expect(screen.queryByText(/Will show as a Draft/)).not.toBeInTheDocument()
    })

    it('shows the Draft hint again if the amount is cleared back to 0', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <TransactionForm categories={categories} onSubmit={() => {}} />
        )

        const amountInput = container.querySelector('input[type="number"]')
        await user.type(amountInput, '.01')
        expect(screen.queryByText(/Will show as a Draft/)).not.toBeInTheDocument()

        await user.clear(amountInput)
        await user.type(amountInput, '0')
        expect(screen.getByText('Will show as a Draft (0 amount)')).toBeInTheDocument()
    })
})