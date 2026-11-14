import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFavouriteEditor } from '@features/favourites/hooks/useFavouriteEditor'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'

vi.mock('@features/favourites/api/favouritesApi')
vi.mock('@features/demo/api/demoApi')

const favourite = { id: 3, type: 'EXPENSE', amount: 4.5, note: 'Kopi', category: { id: 1, name: 'Dining Out' } }

function renderEditor() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider value={false}>{children}</DemoModeContext.Provider>
        </QueryClientProvider>
    )
    return renderHook(() => useFavouriteEditor(), { wrapper })
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('useFavouriteEditor detail', () => {
    it('starts with no detail open', () => {
        const { result } = renderEditor()

        expect(result.current.detail.target).toBeNull()
    })

    it('opens and closes the detail for a Favourite', () => {
        const { result } = renderEditor()

        act(() => result.current.detail.open(favourite))
        expect(result.current.detail.target).toBe(favourite)

        act(() => result.current.detail.close())
        expect(result.current.detail.target).toBeNull()
    })

    it('Edit closes the detail and opens the edit form for that Favourite', () => {
        const { result } = renderEditor()

        act(() => result.current.detail.open(favourite))
        act(() => result.current.detail.edit())

        expect(result.current.detail.target).toBeNull()
        expect(result.current.form.isOpen).toBe(true)
        expect(result.current.form.favourite).toBe(favourite)
    })

    it('Delete closes the detail and asks to confirm deleting that Favourite', () => {
        const { result } = renderEditor()

        act(() => result.current.detail.open(favourite))
        act(() => result.current.detail.delete())

        expect(result.current.detail.target).toBeNull()
        expect(result.current.remove.target).toBe(favourite)
    })
})
