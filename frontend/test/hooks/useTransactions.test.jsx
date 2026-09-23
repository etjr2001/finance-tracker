import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTransactions } from '../../src/hooks/useTransactions'
import { DemoModeContext } from '../../src/demo/DemoModeContext'
import * as transactionsApi from '../../src/api/transactions'
import * as demoApi from '../../src/demo/demoApi'

vi.mock('../../src/api/transactions')
vi.mock('../../src/demo/demoApi')

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
        const { result } = renderHook(() => useTransactions(), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(transactionsApi.listTransactions).toHaveBeenCalled()
        expect(demoApi.listTransactions).not.toHaveBeenCalled()
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.listTransactions.mockResolvedValue([{ id: 2 }])
        const { result } = renderHook(() => useTransactions(), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.listTransactions).toHaveBeenCalled()
        expect(transactionsApi.listTransactions).not.toHaveBeenCalled()
    })
})
