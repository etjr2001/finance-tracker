import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <TransactionsPage />
        </QueryClientProvider>
    )
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
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.stringContaining('Groceries — Weekly shop')
        )
    })

    it('does not delete when the confirmation is dismissed', async () => {
        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(transactionsApi.deleteTransaction).not.toHaveBeenCalled()
    })

    it('deletes when the confirmation is accepted', async () => {
        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Weekly shop')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

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
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Weekly shop')
        const [firstDelete, secondDelete] = screen.getAllByRole('button', { name: 'Delete' })

        await user.click(firstDelete)

        await waitFor(() => expect(firstDelete).toBeDisabled())
        expect(secondDelete).toBeEnabled()

        resolveDelete()
        await waitFor(() => expect(firstDelete).toBeEnabled())
    })
})