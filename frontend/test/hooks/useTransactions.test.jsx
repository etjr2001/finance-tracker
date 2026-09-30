import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import { useTransactions, useDrafts, useCreateTransaction } from '@features/transactions/hooks/useTransactions'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import * as transactionsApi from '@features/transactions/api/transactionsApi'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/transactions/api/transactionsApi')
vi.mock('@features/demo/api/demoApi')

function wrapper(isDemo) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider value={isDemo}>{children}</DemoModeContext.Provider>
        </QueryClientProvider>
    )
}

describe('useTransactions demo branching', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('calls the real API and keys the query with isDemo=false outside demo mode', async () => {
        transactionsApi.listTransactions.mockResolvedValue([{ id: 1 }])
        const { result } = renderHook(() => useTransactions('2026-09'), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(transactionsApi.listTransactions).toHaveBeenCalledWith('2026-09')
        expect(demoApi.listTransactions).not.toHaveBeenCalled()
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.listTransactions.mockResolvedValue([{ id: 2 }])
        const { result } = renderHook(() => useTransactions('2026-09'), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.listTransactions).toHaveBeenCalledWith('2026-09')
        expect(transactionsApi.listTransactions).not.toHaveBeenCalled()
    })

    it('refetches when the month changes and keeps the previous data meanwhile', async () => {
        transactionsApi.listTransactions.mockImplementation((month) =>
            month === '2026-09' ? Promise.resolve([{ id: 1 }]) : new Promise(() => {})
        )
        const { result, rerender } = renderHook(({ month }) => useTransactions(month), {
            wrapper: wrapper(false),
            initialProps: { month: '2026-09' },
        })
        await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))

        rerender({ month: '2026-10' })

        expect(transactionsApi.listTransactions).toHaveBeenLastCalledWith('2026-10')
        expect(result.current.data).toEqual([{ id: 1 }])
        expect(result.current.isPlaceholderData).toBe(true)
    })
})

describe('useDrafts demo branching', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('calls the real API outside demo mode', async () => {
        transactionsApi.listDrafts.mockResolvedValue([{ id: 1 }])
        const { result } = renderHook(() => useDrafts(), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(transactionsApi.listDrafts).toHaveBeenCalled()
        expect(demoApi.listDrafts).not.toHaveBeenCalled()
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.listDrafts.mockResolvedValue([{ id: 2 }])
        const { result } = renderHook(() => useDrafts(), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.listDrafts).toHaveBeenCalled()
        expect(transactionsApi.listDrafts).not.toHaveBeenCalled()
    })
})

describe('useTransactions while offline', () => {
    beforeEach(() => {
        onlineManager.setOnline(false)
    })

    afterEach(() => {
        onlineManager.setOnline(true)
        vi.restoreAllMocks()
    })

    it('runs the demo query instead of pausing', async () => {
        demoApi.listTransactions.mockResolvedValue([{ id: 2 }])
        const { result } = renderHook(() => useTransactions('2026-09'), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('runs a demo create instead of pausing', async () => {
        demoApi.createTransaction.mockResolvedValue({ id: 3 })
        const { result } = renderHook(() => useCreateTransaction(), { wrapper: wrapper(true) })

        await act(() => result.current.mutateAsync({ amount: 5 }))

        expect(demoApi.createTransaction).toHaveBeenCalled()
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('still pauses the real-API query', async () => {
        transactionsApi.listTransactions.mockResolvedValue([{ id: 1 }])
        const { result } = renderHook(() => useTransactions('2026-09'), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.fetchStatus).toBe('paused'))
        expect(transactionsApi.listTransactions).not.toHaveBeenCalled()
    })
})
