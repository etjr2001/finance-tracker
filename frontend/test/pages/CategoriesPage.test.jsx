import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoriesPage } from '@features/categories/pages/CategoriesPage'
import * as categoriesApi from '@features/categories/api/categoriesApi'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

vi.mock('@features/categories/api/categoriesApi')

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
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        expect(screen.getByText('Delete category "Groceries"? This can\'t be undone.')).toBeInTheDocument()
    })

    it('does not delete when the confirmation is dismissed', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        expect(categoriesApi.deleteCategory).not.toHaveBeenCalled()
        // The category is still on screen, since nothing was deleted.
        expect(screen.getByText('Groceries')).toBeInTheDocument()
        expect(screen.queryByText(/This can't be undone/)).not.toBeInTheDocument()
    })

    it('deletes when the confirmation is accepted', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Delete' }))

        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

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
        renderPage()

        await screen.findByText('Groceries')
        const [groceriesDelete, salaryDelete] = screen.getAllByRole('button', { name: 'Delete' })

        await user.click(groceriesDelete)
        const dialog = screen.getByText(/This can't be undone/).closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(groceriesDelete).toBeDisabled())
        expect(salaryDelete).toBeEnabled()

        resolveDelete()
        await waitFor(() => expect(groceriesDelete).toBeEnabled())
    })
})

describe('CategoriesPage field limits', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('caps the new-category name field length', () => {
        renderPage()
        expect(screen.getByPlaceholderText('New category name')).toHaveAttribute(
            'maxLength',
            String(MAX_CATEGORY_NAME_LENGTH)
        )
    })

    it('caps the rename field length', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Edit' }))

        expect(screen.getByDisplayValue('Groceries')).toHaveAttribute('maxLength', String(MAX_CATEGORY_NAME_LENGTH))
    })
})

describe('CategoriesPage create/edit colour and icon', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('auto-assigns a colour and guesses an icon from the name on create', async () => {
        categoriesApi.listCategories.mockResolvedValue([])
        categoriesApi.createCategory.mockResolvedValue({ id: 2, name: 'Dining Out', colorKey: 'ochre', iconKey: 'utensils-crossed' })
        const user = userEvent.setup()
        renderPage()

        await user.type(screen.getByPlaceholderText('New category name'), 'Dining Out')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        await waitFor(() => expect(categoriesApi.createCategory).toHaveBeenCalled())
        const payload = categoriesApi.createCategory.mock.calls[0][0]
        expect(payload).toEqual({ name: 'Dining Out', colorKey: expect.any(String), iconKey: 'utensils-crossed' })
    })

    it('creates with a null icon when the name matches no keyword', async () => {
        categoriesApi.listCategories.mockResolvedValue([])
        categoriesApi.createCategory.mockResolvedValue({ id: 2, name: 'Miscellaneous', colorKey: 'ochre', iconKey: null })
        const user = userEvent.setup()
        renderPage()

        await user.type(screen.getByPlaceholderText('New category name'), 'Miscellaneous')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        await waitFor(() => expect(categoriesApi.createCategory).toHaveBeenCalled())
        const payload = categoriesApi.createCategory.mock.calls[0][0]
        expect(payload).toEqual({ name: 'Miscellaneous', colorKey: expect.any(String), iconKey: null })
    })

    it('lets an edit change the colour and icon, and saves both', async () => {
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries', colorKey: 'slate', iconKey: 'tag' }])
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Groceries')
        await user.click(screen.getByRole('button', { name: 'Edit' }))

        await user.click(screen.getByRole('button', { name: 'Colour teal' }))
        await user.click(screen.getByRole('button', { name: 'Icon bus' }))
        await user.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => expect(categoriesApi.updateCategory).toHaveBeenCalled())
        const [id, payload] = categoriesApi.updateCategory.mock.calls[0]
        expect(id).toBe(1)
        expect(payload).toEqual({ name: 'Groceries', colorKey: 'teal', iconKey: 'bus' })
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