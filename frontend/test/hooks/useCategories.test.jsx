import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCategories } from '../../src/hooks/useCategories'
import { DemoModeContext } from '../../src/demo/DemoModeContext'
import * as categoriesApi from '../../src/api/categories'
import * as demoApi from '../../src/demo/demoApi'

vi.mock('../../src/api/categories')
vi.mock('../../src/demo/demoApi')

function wrapper(isDemo) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider value={isDemo}>{children}</DemoModeContext.Provider>
        </QueryClientProvider>
    )
}

describe('useCategories demo branching', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('calls the real API outside demo mode', async () => {
        categoriesApi.listCategories.mockResolvedValue([{ id: 1, name: 'Groceries' }])
        const { result } = renderHook(() => useCategories(), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(categoriesApi.listCategories).toHaveBeenCalled()
        expect(demoApi.listCategories).not.toHaveBeenCalled()
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.listCategories.mockResolvedValue([{ id: 2, name: 'Rent' }])
        const { result } = renderHook(() => useCategories(), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.listCategories).toHaveBeenCalled()
        expect(categoriesApi.listCategories).not.toHaveBeenCalled()
    })
})
