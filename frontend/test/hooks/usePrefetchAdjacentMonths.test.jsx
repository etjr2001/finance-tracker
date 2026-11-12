import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePrefetchAdjacentMonths } from '@hooks/usePrefetchAdjacentMonths'

function setup() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const fetchMonth = vi.fn((month) => Promise.resolve(`data for ${month}`))
    const getQueryOptions = (month) => ({ queryKey: ['thing', month], queryFn: () => fetchMonth(month) })
    const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    return { queryClient, fetchMonth, getQueryOptions, wrapper }
}

describe('usePrefetchAdjacentMonths', () => {
    it('loads the months either side into the cache', async () => {
        const { queryClient, fetchMonth, getQueryOptions, wrapper } = setup()

        renderHook(() => usePrefetchAdjacentMonths('2026-01', getQueryOptions), { wrapper })

        // Crosses the year boundary backwards.
        await waitFor(() => expect(queryClient.getQueryData(['thing', '2025-12'])).toBe('data for 2025-12'))
        expect(queryClient.getQueryData(['thing', '2026-02'])).toBe('data for 2026-02')
        expect(fetchMonth).not.toHaveBeenCalledWith('2026-01')
    })

    it('prefetches the new neighbours when the month changes, without refetching ones already loaded', async () => {
        const { fetchMonth, getQueryOptions, wrapper } = setup()
        const { rerender } = renderHook(({ month }) => usePrefetchAdjacentMonths(month, getQueryOptions), {
            wrapper,
            initialProps: { month: '2026-09' },
        })
        await waitFor(() => expect(fetchMonth).toHaveBeenCalledTimes(2))

        rerender({ month: '2026-10' })

        await waitFor(() => expect(fetchMonth).toHaveBeenCalledWith('2026-11'))
        // Each month once: 2026-10 was already prefetched from 2026-09, so
        // landing on it doesn't fetch it again here.
        expect(fetchMonth.mock.calls.map(([month]) => month).sort()).toEqual(['2026-08', '2026-09', '2026-10', '2026-11'])
    })

    it('does not refetch on a re-render for the same month', async () => {
        const { fetchMonth, getQueryOptions, wrapper } = setup()
        const { rerender } = renderHook(({ month }) => usePrefetchAdjacentMonths(month, getQueryOptions), {
            wrapper,
            initialProps: { month: '2026-09' },
        })
        await waitFor(() => expect(fetchMonth).toHaveBeenCalledTimes(2))

        rerender({ month: '2026-09' })

        expect(fetchMonth).toHaveBeenCalledTimes(2)
    })
})
