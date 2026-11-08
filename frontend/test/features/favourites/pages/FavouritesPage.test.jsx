import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FavouritesPage } from '@features/favourites/pages/FavouritesPage'
import * as favouritesApi from '@features/favourites/api/favouritesApi'
import * as categoriesApi from '@features/categories/api/categoriesApi'

vi.mock('@features/favourites/api/favouritesApi')
vi.mock('@features/categories/api/categoriesApi')

const categories = [
    { id: 1, name: 'Groceries' },
    { id: 2, name: 'Rent' },
    { id: 3, name: 'Utilities' },
]

const rent = { id: 10, type: 'EXPENSE', amount: 1500, note: 'Monthly', category: { id: 2, name: 'Rent' } }
const utilities = { id: 11, type: 'EXPENSE', amount: 0, note: null, category: { id: 3, name: 'Utilities' } }

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <FavouritesPage />
        </QueryClientProvider>
    )
}

function rowFor(text) {
    return screen.getByText(text).closest('.flex.items-center')
}

function getBackdrop(container) {
    return container.ownerDocument.querySelector('.fixed.inset-0')
}

describe('FavouritesPage list', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue(categories)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('names a Favourite by its note, with the Category below it, and shows the amount', async () => {
        favouritesApi.listFavourites.mockResolvedValue([rent])
        renderPage()

        const name = await screen.findByText('Monthly')
        const category = screen.getByText('Rent')
        // Note first, Category second, in document order.
        expect(name.compareDocumentPosition(category) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText(/1,500\.00/)).toBeInTheDocument()
    })

    it('names a Favourite without a note by its Category alone', async () => {
        favouritesApi.listFavourites.mockResolvedValue([utilities])
        renderPage()

        await screen.findByText('Utilities')
        expect(screen.getAllByText('Utilities')).toHaveLength(1)
    })

    it('shows "No amount" instead of $0.00 for a zero-amount Favourite', async () => {
        favouritesApi.listFavourites.mockResolvedValue([utilities])
        renderPage()

        await screen.findByText('Utilities')
        expect(within(rowFor('Utilities')).getByText('No amount')).toBeInTheDocument()
        expect(screen.queryByText(/0\.00/)).not.toBeInTheDocument()
    })

    it('shows an empty state when there are no Favourites', async () => {
        favouritesApi.listFavourites.mockResolvedValue([])
        renderPage()

        expect(await screen.findByText(/No favourites yet/)).toBeInTheDocument()
    })

    it('shows an error when the list fails to load', async () => {
        favouritesApi.listFavourites.mockRejectedValue(new Error('boom'))
        renderPage()

        expect(await screen.findByText('Could not load favourites.')).toBeInTheDocument()
    })
})

describe('FavouritesPage create and edit', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue(categories)
        favouritesApi.listFavourites.mockResolvedValue([rent])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('creates a Favourite from scratch, with no date field and no date in the payload', async () => {
        favouritesApi.createFavourite.mockResolvedValue({ ...utilities, id: 12 })
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        expect(screen.getByText('Add favourite')).toBeInTheDocument()
        expect(container.ownerDocument.querySelector('input[type="date"]')).toBeNull()

        await user.click(screen.getByRole('radio', { name: 'Income' }))
        await user.clear(screen.getByLabelText('Amount'))
        await user.type(screen.getByLabelText('Amount'), '25')
        await user.selectOptions(screen.getByLabelText('Category'), '1')
        await user.type(screen.getByLabelText('Note (optional)'), 'Refund')
        await user.click(screen.getByRole('button', { name: 'Save favourite' }))

        await waitFor(() =>
            expect(favouritesApi.createFavourite).toHaveBeenCalledWith(
                { type: 'INCOME', amount: 25, note: 'Refund', categoryId: 1 },
                expect.anything()
            )
        )
        await waitFor(() => expect(screen.queryByText('Add favourite')).not.toBeInTheDocument())
    })

    it('says a zero amount will start a Draft when used', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        expect(screen.getByText('0 starts a Draft')).toBeInTheDocument()

        await user.type(screen.getByLabelText('Amount'), '5')
        expect(screen.queryByText('0 starts a Draft')).not.toBeInTheDocument()
    })

    it('explains under the note that it names the Favourite and is copied to each Transaction', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Monthly')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        expect(screen.getByText('Names the favourite; copied to each transaction')).toBeInTheDocument()
    })

    it('orders the fields Category, Amount, Note, so tabbing follows the layout', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Monthly')
        await user.click(screen.getByRole('button', { name: 'Add' }))

        screen.getByLabelText('Category').focus()
        await user.tab()
        expect(screen.getByLabelText('Amount')).toHaveFocus()
        await user.tab()
        expect(screen.getByLabelText('Note (optional)')).toHaveFocus()
    })

    it('disables Save while the save is in flight', async () => {
        favouritesApi.createFavourite.mockImplementation(() => new Promise(() => {}))
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.selectOptions(screen.getByLabelText('Category'), '1')
        await user.click(screen.getByRole('button', { name: 'Save favourite' }))

        await waitFor(() => expect(screen.getByRole('button', { name: 'Save favourite' })).toBeDisabled())
    })

    it("keeps the form open and shows the server's error when saving fails", async () => {
        favouritesApi.createFavourite.mockRejectedValue({ response: { data: { error: 'Category not found' } } })
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.selectOptions(screen.getByLabelText('Category'), '1')
        await user.click(screen.getByRole('button', { name: 'Save favourite' }))

        expect(await screen.findByText('Category not found')).toBeInTheDocument()
        expect(screen.getByText('Add favourite')).toBeInTheDocument()
    })

    it('opens the edit form prefilled and sends every field to update', async () => {
        favouritesApi.updateFavourite.mockResolvedValue({ ...rent, amount: 1600 })
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(within(rowFor('Rent')).getByRole('button', { name: 'Edit' }))

        expect(screen.getByText('Edit favourite')).toBeInTheDocument()
        expect(screen.getByLabelText('Amount')).toHaveValue('1500')
        expect(screen.getByLabelText('Category')).toHaveValue('2')
        expect(screen.getByLabelText('Note (optional)')).toHaveValue('Monthly')

        await user.clear(screen.getByLabelText('Amount'))
        await user.type(screen.getByLabelText('Amount'), '1600')
        await user.click(screen.getByRole('button', { name: 'Save changes' }))

        await waitFor(() =>
            expect(favouritesApi.updateFavourite).toHaveBeenCalledWith(10, {
                type: 'EXPENSE',
                amount: 1600,
                note: 'Monthly',
                categoryId: 2,
            })
        )
    })

    it('closes without asking when nothing changed', async () => {
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.click(getBackdrop(container))

        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
        expect(screen.queryByText('Add favourite')).not.toBeInTheDocument()
    })

    it('asks before discarding unsaved changes, and keeps them on Cancel', async () => {
        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Rent')
        await user.click(screen.getByRole('button', { name: 'Add' }))
        await user.type(screen.getByLabelText('Note (optional)'), 'Kopi')
        await user.click(getBackdrop(container))

        const dialog = screen.getByText('Discard unsaved changes?').closest('div')
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

        expect(screen.getByLabelText('Note (optional)')).toHaveValue('Kopi')
    })
})

describe('FavouritesPage delete', () => {
    beforeEach(() => {
        categoriesApi.listCategories.mockResolvedValue(categories)
        favouritesApi.listFavourites.mockResolvedValue([rent])
        favouritesApi.deleteFavourite.mockResolvedValue(undefined)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('asks for confirmation, naming the Favourite, and deletes on confirm', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(within(rowFor('Rent')).getByRole('button', { name: 'Delete' }))

        const message = screen.getByText('Delete favourite "Rent — Monthly"? This can\'t be undone.')
        await user.click(within(message.closest('div')).getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(favouritesApi.deleteFavourite).toHaveBeenCalledWith(10, expect.anything()))
    })

    it('does not delete when the confirmation is cancelled', async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(within(rowFor('Rent')).getByRole('button', { name: 'Delete' }))

        const message = screen.getByText(/This can't be undone/)
        await user.click(within(message.closest('div')).getByRole('button', { name: 'Cancel' }))

        expect(favouritesApi.deleteFavourite).not.toHaveBeenCalled()
        expect(screen.getByText('Rent')).toBeInTheDocument()
    })

    it('shows a fallback error on the page when the delete fails without a message', async () => {
        favouritesApi.deleteFavourite.mockRejectedValue({})
        const user = userEvent.setup()
        renderPage()

        await screen.findByText('Rent')
        await user.click(within(rowFor('Rent')).getByRole('button', { name: 'Delete' }))
        const message = screen.getByText(/This can't be undone/)
        await user.click(within(message.closest('div')).getByRole('button', { name: 'Delete' }))

        expect(await screen.findByText('Could not delete favourite.')).toBeInTheDocument()
    })
})
