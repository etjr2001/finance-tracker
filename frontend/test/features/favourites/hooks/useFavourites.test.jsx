import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import {
    useFavourites,
    useCreateFavourite,
    useUpdateFavourite,
    useDeleteFavourite,
} from '@features/favourites/hooks/useFavourites'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import * as favouritesApi from '@features/favourites/api/favouritesApi'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/favourites/api/favouritesApi')
vi.mock('@features/demo/api/demoApi')

function setup(isDemo) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider value={isDemo}>{children}</DemoModeContext.Provider>
        </QueryClientProvider>
    )
    return { queryClient, wrapper }
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('useFavourites demo branching', () => {
    it('calls the real API outside demo mode', async () => {
        favouritesApi.listFavourites.mockResolvedValue([{ id: 1 }])
        const { queryClient, wrapper } = setup(false)

        const { result } = renderHook(() => useFavourites(), { wrapper })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(favouritesApi.listFavourites).toHaveBeenCalled()
        expect(demoApi.listFavourites).not.toHaveBeenCalled()
        expect(queryClient.getQueryData(['favourites', false])).toEqual([{ id: 1 }])
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.listFavourites.mockResolvedValue([{ id: 2 }])
        const { queryClient, wrapper } = setup(true)

        const { result } = renderHook(() => useFavourites(), { wrapper })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.listFavourites).toHaveBeenCalled()
        expect(favouritesApi.listFavourites).not.toHaveBeenCalled()
        expect(queryClient.getQueryData(['favourites', true])).toEqual([{ id: 2 }])
    })
})

describe('useFavourites while offline', () => {
    beforeEach(() => {
        onlineManager.setOnline(false)
    })

    afterEach(() => {
        onlineManager.setOnline(true)
    })

    it('runs the demo query instead of pausing', async () => {
        demoApi.listFavourites.mockResolvedValue([{ id: 2 }])
        const { wrapper } = setup(true)

        const { result } = renderHook(() => useFavourites(), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
})

describe('Favourite writes', () => {
    const payload = { type: 'EXPENSE', amount: 5, note: null, categoryId: 1 }

    it('creates and refreshes the Favourites list', async () => {
        favouritesApi.createFavourite.mockResolvedValue({ id: 3 })
        const { queryClient, wrapper } = setup(false)
        const { result } = renderHook(() => useCreateFavourite(), { wrapper })

        await act(() => result.current.mutateAsync(payload))

        expect(favouritesApi.createFavourite.mock.calls[0][0]).toEqual(payload)
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favourites', false] })
    })

    it('updates by id, passing the rest as the payload', async () => {
        favouritesApi.updateFavourite.mockResolvedValue({ id: 3 })
        const { queryClient, wrapper } = setup(false)
        const { result } = renderHook(() => useUpdateFavourite(), { wrapper })

        await act(() => result.current.mutateAsync({ id: 3, ...payload }))

        expect(favouritesApi.updateFavourite).toHaveBeenCalledWith(3, payload)
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favourites', false] })
    })

    it('deletes through demoApi in demo mode and refreshes the demo list', async () => {
        demoApi.deleteFavourite.mockResolvedValue(undefined)
        const { queryClient, wrapper } = setup(true)
        const { result } = renderHook(() => useDeleteFavourite(), { wrapper })

        await act(() => result.current.mutateAsync(3))

        expect(demoApi.deleteFavourite.mock.calls[0][0]).toBe(3)
        expect(favouritesApi.deleteFavourite).not.toHaveBeenCalled()
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favourites', true] })
    })
})
