import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TransactionForm } from '@features/transactions/components/TransactionForm'
import * as categoriesApi from '@features/categories/api/categoriesApi'
import * as favouritesApi from '@features/favourites/api/favouritesApi'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

// TransactionForm calls useCreateCategory() internally (a real React Query
// hook), so every render needs a QueryClientProvider ancestor now, even
// tests that never touch category creation. The Favourites picker
// lists Favourites and can link to their page, hence the API mock and the
// router.
vi.mock('@features/categories/api/categoriesApi')
vi.mock('@features/favourites/api/favouritesApi')

const categories = [
    { id: 1, name: 'Groceries' },
    { id: 2, name: 'Salary' },
]

function renderForm(props = {}) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return render(
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                <TransactionForm categories={categories} onSubmit={() => {}} {...props} />
            </QueryClientProvider>
        </MemoryRouter>
    )
}

describe('TransactionForm date picker', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens the native date picker on click anywhere in the field', async () => {
        const showPicker = vi.fn()
        HTMLInputElement.prototype.showPicker = showPicker

        const user = userEvent.setup()
        const { container } = renderForm()

        const dateInput = container.querySelector('input[type="date"]')
        await user.click(dateInput)

        expect(showPicker).toHaveBeenCalledTimes(1)
    })

    it('does not throw in browsers without showPicker support', async () => {
        // Older/unsupported browsers simply don't have the method — the
        // `e.target.showPicker?.()` optional chaining is what this guards.
        delete HTMLInputElement.prototype.showPicker

        const user = userEvent.setup()
        const { container } = renderForm()

        const dateInput = container.querySelector('input[type="date"]')
        await expect(user.click(dateInput)).resolves.not.toThrow()
    })
})

describe('TransactionForm amount help', () => {
    it('explains Drafts behind the (i) next to Amount', async () => {
        const user = userEvent.setup()
        renderForm()
        const help = /Enter 0 to save a Draft and fill it in later/

        expect(screen.queryByText(help)).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'About Amount' }))

        expect(screen.getByText(help)).toBeInTheDocument()
        expect(screen.queryByText('0 shows as a Draft')).not.toBeInTheDocument()
    })
})

describe('TransactionForm draft hint', () => {
    it('shows the Draft hint by default for a new transaction (defaults to $0)', () => {
        renderForm()
        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()
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
        renderForm({ initial })
        expect(screen.queryByText(/0 shows as a Draft/)).not.toBeInTheDocument()
    })

    it('hides the Draft hint once a non-zero amount is entered', async () => {
        const user = userEvent.setup()
        renderForm()

        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()

        const amountInput = screen.getByLabelText('Amount')
        await user.type(amountInput, '.01')

        expect(screen.queryByText(/0 shows as a Draft/)).not.toBeInTheDocument()
    })

    it('shows the Draft hint again if the amount is cleared back to 0', async () => {
        const user = userEvent.setup()
        renderForm()

        const amountInput = screen.getByLabelText('Amount')
        await user.type(amountInput, '.01')
        expect(screen.queryByText(/0 shows as a Draft/)).not.toBeInTheDocument()

        await user.clear(amountInput)
        await user.type(amountInput, '0')
        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()
    })
})

describe('TransactionForm layout', () => {
    it('titles the form Add transaction when creating and Edit transaction when editing', () => {
        const { unmount } = renderForm()
        expect(screen.getByRole('heading', { name: 'Add transaction' })).toBeInTheDocument()
        unmount()

        const initial = { id: 5, type: 'EXPENSE', amount: 1, date: '2026-01-01', note: '', category: { id: 1 } }
        renderForm({ initial })
        expect(screen.getByRole('heading', { name: 'Edit transaction' })).toBeInTheDocument()
    })

    it('orders the fields Category, Amount, Date, Note, so tabbing follows the layout', async () => {
        const user = userEvent.setup()
        renderForm()

        screen.getByLabelText('Category').focus()
        await user.tab()
        expect(screen.getByRole('button', { name: 'About Amount' })).toHaveFocus()
        await user.tab()
        expect(screen.getByLabelText('Amount')).toHaveFocus()
        await user.tab()
        expect(screen.getByLabelText('Date')).toHaveFocus()
        await user.tab()
        expect(screen.getByLabelText('Note (optional)')).toHaveFocus()
    })
})

describe('TransactionForm Favourites picker', () => {
    const lunch = { id: 7, type: 'INCOME', amount: 42.5, note: 'Refund', category: { id: 2, name: 'Salary' } }
    const bill = { id: 8, type: 'EXPENSE', amount: 0, note: null, category: { id: 1, name: 'Groceries' } }

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('offers the picker when adding but not when editing', () => {
        const { unmount } = renderForm()
        expect(screen.getByRole('button', { name: 'Favourites' })).toBeInTheDocument()
        unmount()

        const initial = { id: 5, type: 'EXPENSE', amount: 1, date: '2026-01-01', note: '', category: { id: 1 } }
        renderForm({ initial })
        expect(screen.queryByRole('button', { name: 'Favourites' })).not.toBeInTheDocument()
    })

    it("fills type, amount, Category and note from the picked Favourite, keeps the date, and closes the picker", async () => {
        favouritesApi.listFavourites.mockResolvedValue([lunch])
        const onSubmit = vi.fn()
        const user = userEvent.setup()
        renderForm({ onSubmit })

        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-14' } })
        await user.click(screen.getByRole('button', { name: 'Favourites' }))
        await user.click(await screen.findByRole('button', { name: /Refund/ }))

        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Favourites' })).not.toBeInTheDocument())
        expect(screen.getByRole('radio', { name: 'Income' })).toHaveAttribute('aria-checked', 'true')
        expect(screen.getByLabelText('Amount')).toHaveValue('42.5')
        expect(screen.getByLabelText('Category')).toHaveValue('2')
        expect(screen.getByLabelText('Note (optional)')).toHaveValue('Refund')
        expect(screen.getByLabelText('Date')).toHaveValue('2026-03-14')

        await user.click(screen.getByRole('button', { name: 'Add' }))
        expect(onSubmit).toHaveBeenCalledWith({
            type: 'INCOME',
            amount: 42.5,
            date: '2026-03-14',
            note: 'Refund',
            categoryId: 2,
        })
    })

    it('replaces anything already typed, including clearing the note for a Favourite without one', async () => {
        favouritesApi.listFavourites.mockResolvedValue([bill])
        const user = userEvent.setup()
        renderForm()

        await user.type(screen.getByLabelText('Note (optional)'), 'old note')
        await user.click(screen.getByRole('button', { name: 'Favourites' }))
        await user.click(await screen.findByRole('button', { name: /Groceries/ }))

        expect(screen.getByLabelText('Note (optional)')).toHaveValue('')
        expect(screen.getByLabelText('Category')).toHaveValue('1')
    })

    it('shows the Draft helper after picking a zero-amount Favourite', async () => {
        favouritesApi.listFavourites.mockResolvedValue([bill])
        const user = userEvent.setup()
        renderForm()

        await user.type(screen.getByLabelText('Amount'), '5')
        expect(screen.queryByText('0 shows as a Draft')).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Favourites' }))
        await user.click(await screen.findByRole('button', { name: /Groceries/ }))

        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()
    })

    it('marks the form dirty once a Favourite is picked', async () => {
        favouritesApi.listFavourites.mockResolvedValue([lunch])
        const onDirtyChange = vi.fn()
        const user = userEvent.setup()
        renderForm({ onDirtyChange })

        await user.click(screen.getByRole('button', { name: 'Favourites' }))
        await user.click(await screen.findByRole('button', { name: /Refund/ }))

        expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })

    it('links to the Favourites page when there are none', async () => {
        favouritesApi.listFavourites.mockResolvedValue([])
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole('button', { name: 'Favourites' }))

        expect(await screen.findByText(/No favourites yet/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Add one on the Favourites page' })).toHaveAttribute('href', '/favourites')
    })

    it('shows an error when Favourites fail to load', async () => {
        favouritesApi.listFavourites.mockRejectedValue(new Error('boom'))
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole('button', { name: 'Favourites' }))

        expect(await screen.findByText('Could not load favourites.')).toBeInTheDocument()
    })
})

describe('TransactionForm dirty tracking', () => {
    it('reports not dirty on initial mount (create mode)', () => {
        const onDirtyChange = vi.fn()
        renderForm({ onDirtyChange })

        expect(onDirtyChange).toHaveBeenCalledWith(false)
    })

    it('reports dirty after a field is changed', () => {
        const onDirtyChange = vi.fn()
        renderForm({ onDirtyChange })

        fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'coffee' } })

        expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })

    it('reports not dirty again once a field is changed back to its initial value', () => {
        const onDirtyChange = vi.fn()
        renderForm({ onDirtyChange })

        const note = screen.getByLabelText('Note (optional)')
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
        renderForm({ initial, onDirtyChange })

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
        renderForm({ initial, onDirtyChange })

        fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'dinner' } })

        expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    })
})

describe('TransactionForm type toggle', () => {
    it('defaults to Expense selected', () => {
        renderForm()
        expect(screen.getByRole('radio', { name: 'Expense' })).toHaveAttribute('aria-checked', 'true')
        expect(screen.getByRole('radio', { name: 'Income' })).toHaveAttribute('aria-checked', 'false')
    })

    it('switches the submitted type to Income when clicked', () => {
        const onSubmit = vi.fn()
        renderForm({ onSubmit })

        fireEvent.click(screen.getByRole('radio', { name: 'Income' }))
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add' }))

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'INCOME' }))
        expect(screen.getByRole('radio', { name: 'Income' })).toHaveAttribute('aria-checked', 'true')
    })
})

describe('TransactionForm submission', () => {
    it('submits the entered values with the right shape', () => {
        const onSubmit = vi.fn()
        renderForm({ onSubmit })

        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.5' } })
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
        fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'bonus' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add' }))

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
        renderForm({ onSubmit })

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
        fireEvent.click(screen.getByRole('button', { name: 'Add' }))

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
        renderForm({ initial, onSubmit })

        expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 12.5, categoryId: 1, note: 'lunch' })
        )
    })
})

describe('TransactionForm amount input', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('selects the existing value when the amount field is focused', () => {
        const select = vi.spyOn(HTMLInputElement.prototype, 'select')
        renderForm()

        fireEvent.focus(screen.getByLabelText('Amount'))

        expect(select).toHaveBeenCalledTimes(1)
    })

    it('greys out the amount text while it is 0', () => {
        renderForm()
        expect(screen.getByLabelText('Amount')).toHaveClass('text-ink-soft')
    })

    it('uses normal text color once a non-zero amount is entered', async () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        await userEvent.setup().type(amountInput, '.01')

        expect(amountInput).not.toHaveClass('text-ink-soft')
    })
})

describe('TransactionForm amount character filtering', () => {
    // type="number" used to have the browser filter keystrokes for us; now
    // that the field is type="text" (for a better mobile keyboard, see the
    // "field limits" tests below), handleAmountChange has to reject
    // anything that isn't a digit or a single decimal point itself.
    it.each([
        ['letters', '12a'],
        ['a leading minus sign', '-5'],
        ['scientific notation', '1e5'],
        ['a second decimal point', '1.2.3'],
    ])('rejects %s', (_label, value) => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value } })

        expect(amountInput).toHaveValue('0')
    })

    it('still allows a plain decimal amount', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '12.34' } })

        expect(amountInput).toHaveValue('12.34')
    })
})

describe('TransactionForm amount max cue', () => {
    const hintText = 'Max amount is 9,999,999,999.99'

    it('does not show the max hint by default', () => {
        renderForm()
        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
    })

    it('blocks an amount that would exceed the numeric(12,2) column and shows a hint', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '99999999999.99' } })

        expect(amountInput).toHaveValue('0')
        expect(screen.getByText(hintText)).toBeInTheDocument()
    })

    it('allows an amount exactly at the max', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '9999999999.99' } })

        expect(amountInput).toHaveValue('9999999999.99')
        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
    })

    it('clears the hint once a valid amount is entered', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '99999999999.99' } })
        expect(screen.getByText(hintText)).toBeInTheDocument()

        fireEvent.change(amountInput, { target: { value: '42.5' } })

        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
        expect(amountInput).toHaveValue('42.5')
    })
})

describe('TransactionForm amount decimal-place cue', () => {
    const hintText = 'Only 2 decimal places allowed'

    it('does not show the decimal-place hint by default', () => {
        renderForm()
        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
    })

    it('blocks a 3rd decimal digit and shows a hint', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '12.345' } })

        expect(amountInput).toHaveValue('0')
        expect(screen.getByText(hintText)).toBeInTheDocument()
    })

    it('allows exactly 2 decimal digits', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '12.34' } })

        expect(amountInput).toHaveValue('12.34')
        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
    })

    it('clears the hint once corrected to a valid amount', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        fireEvent.change(amountInput, { target: { value: '12.345' } })
        expect(screen.getByText(hintText)).toBeInTheDocument()

        fireEvent.change(amountInput, { target: { value: '12.34' } })

        expect(screen.queryByText(hintText)).not.toBeInTheDocument()
        expect(amountInput).toHaveValue('12.34')
    })
})

describe('TransactionForm field limits', () => {
    // type="text" + inputMode="decimal", not type="number": on iOS Safari,
    // type="number" brings up the "numbers and punctuation" keyboard page
    // (includes -, comma), not the clean 0-9 + decimal keypad inputMode
    // gives on both iOS and Android.
    it('uses a decimal-friendly mobile keyboard instead of type="number"', () => {
        renderForm()
        const amountInput = screen.getByLabelText('Amount')

        expect(amountInput).toHaveAttribute('type', 'text')
        expect(amountInput).toHaveAttribute('inputMode', 'decimal')
    })

    it('caps the note field length', () => {
        renderForm()
        expect(screen.getByLabelText('Note (optional)')).toHaveAttribute('maxLength', '256')
    })

    it('caps the new-category name field length', () => {
        renderForm()
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        expect(screen.getByPlaceholderText('Category name')).toHaveAttribute(
            'maxLength',
            String(MAX_CATEGORY_NAME_LENGTH)
        )
    })
})

describe('TransactionForm category sorting', () => {
    it('lists categories alphabetically regardless of prop order', () => {
        renderForm({
            categories: [
                { id: 2, name: 'Salary' },
                { id: 1, name: 'Groceries' },
            ],
        })

        const options = screen.getAllByRole('option').map((o) => o.textContent)
        // "Select one" first, then alphabetical, "+ Add new category…" last.
        expect(options).toEqual(['Select one', 'Groceries', 'Salary', '+ Add new category…'])
    })
})

describe('TransactionForm category creation', () => {
    beforeEach(() => {
        categoriesApi.createCategory.mockResolvedValue({ id: 99, name: 'Subscriptions' })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens a modal with a name field when "+ Add new category…" is selected', () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })

        expect(screen.getByText('New category name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Category name')).toBeInTheDocument()
    })

    it('does not change the selected category while the add-category modal is open', () => {
        renderForm()

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '__new__' } })

        // The select itself should have snapped back to its previous (empty) value.
        expect(select).toHaveValue('')
    })

    it('creates a new category and selects it', async () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        fireEvent.change(screen.getByPlaceholderText('Category name'), {
            target: { value: 'Subscriptions' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        await waitFor(() => expect(categoriesApi.createCategory).toHaveBeenCalled())
        expect(categoriesApi.createCategory.mock.calls[0][0]).toEqual(
            expect.objectContaining({ name: 'Subscriptions' })
        )
        await waitFor(() => expect(screen.queryByText('New category name')).not.toBeInTheDocument())
        expect(screen.getByRole('combobox')).toHaveValue('99')
        expect(screen.getByRole('option', { name: 'Subscriptions' })).toBeInTheDocument()
    })

    it('creating via Enter in the name field works the same as clicking Create', async () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        const nameInput = screen.getByPlaceholderText('Category name')
        fireEvent.change(nameInput, { target: { value: 'Subscriptions' } })
        fireEvent.keyDown(nameInput, { key: 'Enter' })

        await waitFor(() => expect(categoriesApi.createCategory).toHaveBeenCalled())
    })

    it('reuses an existing category instead of creating a duplicate, case-insensitively', async () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        fireEvent.change(screen.getByPlaceholderText('Category name'), {
            target: { value: 'groceries' }, // existing category is "Groceries"
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(categoriesApi.createCategory).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByText('New category name')).not.toBeInTheDocument())
        expect(screen.getByRole('combobox')).toHaveValue('1') // existing Groceries id
    })

    it('closes without creating anything when Cancel is clicked', async () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        fireEvent.change(screen.getByPlaceholderText('Category name'), {
            target: { value: 'Subscriptions' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(categoriesApi.createCategory).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByText('New category name')).not.toBeInTheDocument())
        expect(screen.getByRole('combobox')).toHaveValue('')
    })

    it('closes without creating anything on outside click', async () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        const backdrop = document.querySelector('.fixed.inset-0')
        fireEvent.mouseDown(backdrop)

        expect(categoriesApi.createCategory).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByText('New category name')).not.toBeInTheDocument())
    })

    it('shows an error and keeps the modal open when creation fails', async () => {
        categoriesApi.createCategory.mockRejectedValueOnce(new Error('boom'))
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        fireEvent.change(screen.getByPlaceholderText('Category name'), {
            target: { value: 'Subscriptions' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        await screen.findByText('boom')
        expect(screen.getByText('New category name')).toBeInTheDocument()
    })

    it('ignores a blank category name', () => {
        renderForm()

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '__new__' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(categoriesApi.createCategory).not.toHaveBeenCalled()
        expect(screen.getByText('New category name')).toBeInTheDocument()
    })
})