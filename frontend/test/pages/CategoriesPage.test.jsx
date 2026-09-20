import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CategoriesPage from '../../src/pages/CategoriesPage'
import * as categoriesApi from '../../src/api/categories'

vi.mock('../../src/api/categories')

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <CategoriesPage />
        </QueryClientProvider>
    )
}

describe('CategoriesPage delete confirmation', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
        categoriesApi.deleteCategory.mockResolvedValue(undefined)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('asks for confirmation before deleting, naming the category', async () => {
        const user = userEvent.setup()
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Groceries'))
    })

    it('does not delete when the confirmation is dismissed', async () => {
        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(categoriesApi.deleteCategory).not.toHaveBeenCalled()
        // The category is still on screen, since nothing was deleted.
        expect(screen.getByText('Groceries')).toBeInTheDocument()
    })

    it('deletes when the confirmation is accepted', async () => {
        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(categoriesApi.deleteCategory).toHaveBeenCalledWith(1, expect.anything()))
    })

    it('disables only the row being deleted while its delete is in flight, not other rows', async () => {
        categoriesApi.listCategories.mockResolvedValue([
            { id: 1, name: 'Groceries' },
            { id: 2, name: 'Salary' },
        ])
        let resolveDelete
        categoriesApi.deleteCategory.mockImplementation(
            () => new Promise((resolve) => { resolveDelete = resolve })
        )

        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPage()

        await screen.findByText('Groceries')
        const [groceriesDelete, salaryDelete] = screen.getAllByRole('button', { name: 'Delete' })

        await user.click(groceriesDelete)

        await waitFor(() => expect(groceriesDelete).toBeDisabled())
        expect(salaryDelete).toBeEnabled()

        resolveDelete()
        await waitFor(() => expect(groceriesDelete).toBeEnabled())
    })
})

describe('CategoriesPage stale edit-error', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue([
            { id: 1, name: 'Groceries' },
            { id: 2, name: 'Salary' },
        ])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('clears a failed-edit error when starting a new edit', async () => {
        categoriesApi.updateCategory.mockRejectedValueOnce(new Error('boom'))
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])

        const nameInput = screen.getByDisplayValue('Groceries')
        await user.clear(nameInput)
        await user.type(nameInput, 'Food')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await screen.findByText('boom')

        // Cancel out of the failed edit, then start editing the other category —
        // the old error shouldn't still be showing.
        await user.click(screen.getByRole('button', { name: 'Cancel' }))
        await user.click(screen.getAllByRole('button', { name: 'Edit' })[1])

        expect(screen.queryByText('boom')).not.toBeInTheDocument()
    })
})