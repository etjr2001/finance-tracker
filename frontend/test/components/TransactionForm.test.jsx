import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransactionForm from '../../src/components/TransactionForm'

// NOTE: the form's <label> elements aren't associated with their inputs via
// htmlFor/id, so most of these tests fall back to role-based or container
// queries instead of getByLabelText. Worth fixing at some point — it's both
// a testability gap and an accessibility one.

const categories = [
    { id: 1, name: 'Groceries' },
    { id: 2, name: 'Salary' },
]

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

describe('TransactionForm dirty tracking', () => {
    it('reports not dirty on initial mount (create mode)', () => {
        const onDirtyChange = vi.fn()
        render(<TransactionForm categories={categories} onSubmit={() => {}} onDirtyChange={onDirtyChange} />)

        expect(onDirtyChange).toHaveBeenCalledWith(false)
    })

    it('reports dirty after a field is changed', () => {
        const onDirtyChange = vi.fn()
        render(<TransactionForm categories={categories} onSubmit={() => {}} onDirtyChange={onDirtyChange} />)

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'coffee' } })

        expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })

    it('reports not dirty again once a field is changed back to its initial value', () => {
        const onDirtyChange = vi.fn()
        render(<TransactionForm categories={categories} onSubmit={() => {}} onDirtyChange={onDirtyChange} />)

        const note = screen.getByRole('textbox')
        fireEvent.change(note, { target: { value: 'coffee' } })
        fireEvent.change(note, { target: { value: '' } })

        expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    })

    it('starts not dirty when editing an existing transaction', () => {
        const onDirtyChange = vi.fn()
        const initial = {
            id: 5,
            type: 'EXPENSE',
            amount: 12.5,
            date: '2026-01-01',
            note: 'lunch',
            category: { id: 1, name: 'Groceries' },
        }
        render(
            <TransactionForm
                categories={categories}
                initial={initial}
                onSubmit={() => {}}
                onDirtyChange={onDirtyChange}
            />
        )

        expect(onDirtyChange).toHaveBeenCalledWith(false)
    })

    it('reports dirty once an existing transaction is edited', () => {
        const onDirtyChange = vi.fn()
        const initial = {
            id: 5,
            type: 'EXPENSE',
            amount: 12.5,
            date: '2026-01-01',
            note: 'lunch',
            category: { id: 1, name: 'Groceries' },
        }
        render(
            <TransactionForm
                categories={categories}
                initial={initial}
                onSubmit={() => {}}
                onDirtyChange={onDirtyChange}
            />
        )

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'dinner' } })

        expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
})

describe('TransactionForm submission', () => {
    it('submits the entered values with the right shape', () => {
        const onSubmit = vi.fn()
        render(<TransactionForm categories={categories} onSubmit={onSubmit} />)

        fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42.5' } })
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bonus' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add transaction' }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'EXPENSE',
                amount: 42.5,
                categoryId: 2,
                note: 'bonus',
            })
        )
    })

    it('sends note as null when left blank', () => {
        const onSubmit = vi.fn()
        render(<TransactionForm categories={categories} onSubmit={onSubmit} />)

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add transaction' }))

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ note: null }))
    })

    it('shows the Save changes label and calls onSubmit when editing', () => {
        const onSubmit = vi.fn()
        const initial = {
            id: 5,
            type: 'EXPENSE',
            amount: 12.5,
            date: '2026-01-01',
            note: 'lunch',
            category: { id: 1, name: 'Groceries' },
        }
        render(<TransactionForm categories={categories} initial={initial} onSubmit={onSubmit} />)

        expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 12.5, categoryId: 1, note: 'lunch' })
        )
    })
})