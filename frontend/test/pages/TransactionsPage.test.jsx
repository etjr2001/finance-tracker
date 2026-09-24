import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import TransactionsPage from '../../src/pages/TransactionsPage'
import * as transactionsApi from '../../src/api/transactions'
import * as categoriesApi from '../../src/api/categories'

vi.mock('../../src/api/transactions')
vi.mock('../../src/api/categories')

const sampleTransaction = {
    id: 42,
    type: 'EXPENSE',
    amount: 12.5,
    date: '2026-09-01',
    note: 'Weekly shop',
    category: { id: 1, name: 'Groceries' },
}

// The global test/setup.js polyfill always "matches" (desktop). Tests that
// need mobile behavior override window.matchMedia for their own scope,
// same pattern as test/hooks/useIsMobile.test.jsx.
function mockMobileViewport() {
    window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
}

// Fixtures below are dated in September 2026, so tests view that month
// explicitly rather than relying on whatever "today" happens to be.
function renderPage(initialEntry = '/transactions?month=2026-09') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <QueryClientProvider client={queryClient}>
                <TransactionsPage />
            </QueryClientProvider>
        </MemoryRouter>
    )
}

// Grabs the currently-open modal/dialog's backdrop, for simulating an
// outside click. Assumes only one Modal is open at the time it's called.
function getBackdrop(container) {
    return container.querySelector('.fixed.inset-0')
}

describe('TransactionsPage delete confirmation', () => {
    beforeEach(() => {
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction])
        transactionsApi.deleteTransaction.mockResolvedValue(undefined)
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('asks for confirmation before deleting, describing the transaction', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(screen.getByText("Delete Groceries — Weekly shop? This can't be undone.")).toBeInTheDocument()
    })

    it('does not delete when the confirmation is dismissed', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        expect(transactionsApi.deleteTransaction).not.toHaveBeenCalled()
        expect(screen.queryByText(/This can't be undone/)).not.toBeInTheDocument()
    })

    it('deletes when the confirmation is accepted', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(transactionsApi.deleteTransaction).toHaveBeenCalledWith(42, expect.anything()))
    })

    it('disables only the row being deleted while its delete is in flight, not other rows', async () => {
        const secondTransaction = {
            id: 43,
            type: 'INCOME',
            amount: 1000,
            date: '2026-09-02',
            note: '',
            category: { id: 2, name: 'Salary' },
        }
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction, secondTransaction])
        let resolveDelete
        transactionsApi.deleteTransaction.mockImplementation(
            () => new Promise((resolve) => { resolveDelete = resolve })
        )

        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        const [firstDelete, secondDelete] = screen.getAllByRole('button', { name: 'Delete' })

        await user.click(firstDelete)
        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(firstDelete).toBeDisabled())
        expect(secondDelete).toBeEnabled()

        resolveDelete()
        await waitFor(() => expect(firstDelete).toBeEnabled())
    })
})

describe('TransactionsPage draft badge', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows a Draft badge for a $0 transaction', async () => {
        transactionsApi.listTransactions.mockResolvedValue([
            { ...sampleTransaction, amount: 0 },
        ])
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
        renderPage()

        await screen.findByText('Weekly shop')
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('does not show a Draft badge for a non-zero transaction', async () => {
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction])
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
        renderPage()

        await screen.findByText('Weekly shop')
        expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    })
})

describe('TransactionsPage add/edit modal', () => {
    beforeEach(() => {
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction])
        transactionsApi.createTransaction.mockResolvedValue({ ...sampleTransaction, id: 99 })
        categoriesApi.listCategories.mockResolvedValue([
            { id: 1, name: 'Groceries' },
            { id: 2, name: 'Salary' },
        ])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens the Add form in a modal', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('closes silently on outside click when the form is untouched', async () => {
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        await user.click(getBackdrop(container))

        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument()
    })

    it('shows a discard-confirmation on outside click when dirty, and keeps the form open on Cancel', async () => {
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.type(screen.getByLabelText('Note (optional)'), 'concert tickets')

        await user.click(getBackdrop(container))
        expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument()

        const dialog = screen.getByText('Discard unsaved changes?').closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Note (optional)')).toHaveValue('concert tickets')
    })

    it('closes the form and discards the value when discard is confirmed', async () => {
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.type(screen.getByLabelText('Note (optional)'), 'concert tickets')

        await user.click(getBackdrop(container))
        const dialog = screen.getByText('Discard unsaved changes?').closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Discard' }))

        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument()
    })

    it('submits a new transaction and closes the modal on success', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        const amountInput = screen.getByLabelText('Amount')
        await user.clear(amountInput)
        await user.type(amountInput, '15')
        await user.selectOptions(screen.getByRole('combobox'), '2')
        await user.click(screen.getByRole('button', { name: 'Add transaction' }))

        await waitFor(() => expect(transactionsApi.createTransaction).toHaveBeenCalled())
        expect(transactionsApi.createTransaction.mock.calls[0][0]).toEqual(
            expect.objectContaining({ amount: 15, categoryId: 2 })
        )
        expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument()
    })

    it('stacks the add-category modal over the transaction modal, and an outside click closes only the inner one', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.selectOptions(screen.getByRole('combobox'), '__new__')

        expect(screen.getByText('New category name')).toBeInTheDocument()

        // Two Modal backdrops are now stacked; the category modal's is the
        // one rendered last (it's nested inside TransactionForm, which is
        // itself inside the transaction Modal), so it's last in DOM order.
        const backdrops = document.querySelectorAll('.fixed.inset-0')
        expect(backdrops).toHaveLength(2)
        await user.click(backdrops[backdrops.length - 1])

        // The category modal closed, but the transaction form is still open.
        expect(screen.queryByText('New category name')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })
})

describe('TransactionsPage mobile row', () => {
    beforeEach(() => {
        mockMobileViewport()
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction])
        transactionsApi.deleteTransaction.mockResolvedValue(undefined)
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('does not show inline Edit/Delete on the row', async () => {
        renderPage()

        await screen.findByText('Weekly shop')

        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })

    it('opens a read-only detail card when the row is tapped', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByText('Groceries'))

        // The detail card repeats the category name and note, so there are
        // now two of each — one in the row (still visible behind the
        // modal), one in the card.
        expect(screen.getAllByText('Groceries')).toHaveLength(2)
        expect(screen.getAllByText('Weekly shop')).toHaveLength(2)
    })

    it('hands off to the edit form and closes the detail card', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByText('Groceries'))
        await user.click(screen.getByRole('button', { name: 'Edit' }))

        expect(screen.getByLabelText('Amount')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    })

    it('hands off to the delete confirmation and closes the detail card', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByText('Groceries'))
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(screen.getByText("Delete Groceries — Weekly shop? This can't be undone.")).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(transactionsApi.deleteTransaction).toHaveBeenCalledWith(42, expect.anything()))
    })
})

describe('TransactionsPage month scope', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('only shows transactions dated in the viewed month', async () => {
        transactionsApi.listTransactions.mockResolvedValue([
            sampleTransaction, // 2026-09-01
            { ...sampleTransaction, id: 43, date: '2026-08-15', note: 'August thing' },
        ])
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])

        renderPage('/transactions?month=2026-09')

        await screen.findByText('Weekly shop')
        expect(screen.queryByText('August thing')).not.toBeInTheDocument()
    })

    it('shows an empty state with an Add action when the month has no transactions', async () => {
        transactionsApi.listTransactions.mockResolvedValue([sampleTransaction]) // 2026-09-01
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])

        renderPage('/transactions?month=2026-03')

        expect(await screen.findByText('No transactions in March 2026.')).toBeInTheDocument()
        // Just the header's Add button — no second one in the empty state,
        // which would just be a visible duplicate of it.
        expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(1)
    })

    it('switches to the saved transaction\'s month when it falls outside the viewed month', async () => {
        transactionsApi.listTransactions.mockResolvedValue([])
        transactionsApi.createTransaction.mockResolvedValue({ ...sampleTransaction, date: '2026-11-05' })
        categoriesApi.listCategories.mockResolvedValue([
            { id: 1, name: 'Groceries' },
            { id: 2, name: 'Salary' },
        ])

        const user = userEvent.setup()
        renderPage('/transactions?month=2026-09')

        await user.click(screen.getByRole('button', { name: 'Add' }))
        const amountInput = screen.getByLabelText('Amount')
        await user.clear(amountInput)
        await user.type(amountInput, '15')
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-11-05' } })
        await user.selectOptions(screen.getByRole('combobox'), '2')
        await user.click(screen.getByRole('button', { name: 'Add transaction' }))

        await waitFor(() => expect(transactionsApi.createTransaction).toHaveBeenCalled())
        await screen.findByText('November 2026')
    })
})