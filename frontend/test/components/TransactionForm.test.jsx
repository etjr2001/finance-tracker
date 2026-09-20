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