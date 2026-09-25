import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query'
import { useDashboard } from '@features/dashboard/hooks/useDashboard'
import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import * as dashboardApi from '@features/dashboard/api/dashboardApi'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/dashboard/api/dashboardApi')
vi.mock('@features/demo/api/demoApi')

function wrapper(isDemo) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider value={isDemo}>{children}</DemoModeContext.Provider>
        </QueryClientProvider>
    )
}

describe('useDashboard demo branching', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('calls the real API and keys by isDemo/month outside demo mode', async () => {
        dashboardApi.getDashboard.mockResolvedValue({ totalIncome: 0, totalExpenses: 0, net: 0, byCategory: [] })
        const { result } = renderHook(() => useDashboard('2026-09'), { wrapper: wrapper(false) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(dashboardApi.getDashboard).toHaveBeenCalledWith('2026-09')
        expect(demoApi.getDashboard).not.toHaveBeenCalled()
    })

    it('calls demoApi under DemoModeContext value={true}', async () => {
        demoApi.getDashboard.mockResolvedValue({ totalIncome: 0, totalExpenses: 0, net: 0, byCategory: [] })
        const { result } = renderHook(() => useDashboard('2026-09'), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(demoApi.getDashboard).toHaveBeenCalledWith('2026-09')
        expect(dashboardApi.getDashboard).not.toHaveBeenCalled()
    })
})

describe('useDashboard while offline', () => {
    beforeEach(() => {
        onlineManager.setOnline(false)
    })

    afterEach(() => {
        onlineManager.setOnline(true)
        vi.restoreAllMocks()
    })

    it('runs the demo query instead of pausing', async () => {
        demoApi.getDashboard.mockResolvedValue({ totalIncome: 0, totalExpenses: 0, net: 0, byCategory: [] })
        const { result } = renderHook(() => useDashboard('2026-09'), { wrapper: wrapper(true) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
})
