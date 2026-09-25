import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import { useCategories, useCreateCategory } from '@features/categories/hooks/useCategories'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import * as categoriesApi from '@features/categories/api/categoriesApi'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/categories/api/categoriesApi')
vi.mock('@features/demo/api/demoApi')

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

describe('useCategories while offline', () => {
    beforeEach(() => {
        onlineManager.setOnline(false)
    })

    afterEach(() => {
        onlineManager.setOnline(true)
        vi.restoreAllMocks()
    })

    it('runs the demo query instead of pausing', async () => {
        demoApi.listCategories.mockResolvedValue([{ id: 2, name: 'Rent' }])
        const { result } = renderHook(() => useCategories(), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('runs a demo create instead of pausing', async () => {
        demoApi.createCategory.mockResolvedValue({ id: 3, name: 'Gifts' })
        const { result } = renderHook(() => useCreateCategory(), { wrapper: wrapper(true) })

        await act(() => result.current.mutateAsync({ name: 'Gifts' }))

        expect(demoApi.createCategory).toHaveBeenCalled()
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('still pauses a real-API create', async () => {
        categoriesApi.createCategory.mockResolvedValue({ id: 4, name: 'Gifts' })
        const { result } = renderHook(() => useCreateCategory(), { wrapper: wrapper(false) })

        act(() => result.current.mutate({ name: 'Gifts' }))

        await waitFor(() => expect(result.current.isPaused).toBe(true))
        expect(categoriesApi.createCategory).not.toHaveBeenCalled()
    })
})
