import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { FavouritePicker } from '@features/favourites/components/FavouritePicker'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import * as favouritesApi from '@features/favourites/api/favouritesApi'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/favourites/api/favouritesApi')
vi.mock('@features/demo/api/demoApi')

function renderPicker({ isDemo = false, ...props } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <MemoryRouter>
            <DemoModeContext.Provider value={isDemo}>
                <QueryClientProvider client={queryClient}>
                    <FavouritePicker onPick={() => {}} onClose={() => {}} {...props} />
                </QueryClientProvider>
            </DemoModeContext.Provider>
        </MemoryRouter>
    )
}

describe('FavouritePicker', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('lists Favourites the same way as the Favourites page and hands the picked one to onPick', async () => {
        const rent = { id: 1, type: 'EXPENSE', amount: 1500, note: null, category: { id: 2, name: 'Rent' } }
        favouritesApi.listFavourites.mockResolvedValue([rent])
        const onPick = vi.fn()
        const user = userEvent.setup()
        renderPicker({ onPick })

        await user.click(await screen.findByRole('button', { name: /Rent/ }))

        expect(onPick).toHaveBeenCalledWith(rent)
    })

    it('lists Favourites A–Z by name, ignoring case', async () => {
        favouritesApi.listFavourites.mockResolvedValue([
            { id: 3, type: 'EXPENSE', amount: 5, note: 'kopi', category: { id: 1, name: 'Dining Out' } },
            { id: 2, type: 'EXPENSE', amount: 0, note: null, category: { id: 2, name: 'Utilities' } },
            { id: 1, type: 'EXPENSE', amount: 1500, note: 'Bills', category: { id: 3, name: 'Rent' } },
        ])
        renderPicker()

        const rows = await screen.findAllByRole('button')
        expect(rows.map((row) => row.textContent)).toEqual([
            expect.stringMatching(/^BillsRent/),
            expect.stringMatching(/^kopiDining Out/),
            expect.stringMatching(/^Utilities/),
        ])
    })

    it('links to the demo Favourites page in demo mode', async () => {
        demoApi.listFavourites.mockResolvedValue([])
        renderPicker({ isDemo: true })

        expect(await screen.findByRole('link', { name: 'Add one on the Favourites page' })).toHaveAttribute(
            'href',
            '/demo/favourites'
        )
    })
})
