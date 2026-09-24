import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '../../src/pages/DashboardPage'
import * as dashboardApi from '../../src/api/dashboard'

vi.mock('../../src/api/dashboard')

function renderPage(initialEntry = '/?month=2026-09') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <QueryClientProvider client={queryClient}>
                <DashboardPage />
            </QueryClientProvider>
        </MemoryRouter>
    )
}

describe('DashboardPage month scope', () => {
    beforeEach(() => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 0,
            totalExpenses: 0,
            net: 0,
            byCategory: [],
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('reads the month from the URL and fetches that month', async () => {
        renderPage('/?month=2026-03')

        await screen.findByText('Dashboard')

        expect(dashboardApi.getDashboard).toHaveBeenCalledWith('2026-03')
    })

    it('re-fetches for the next month when the month bar advances', async () => {
        const user = userEvent.setup()
        renderPage('/?month=2026-09')

        await screen.findByText('September 2026')
        await user.click(screen.getByRole('button', { name: 'Next month' }))

        await screen.findByText('October 2026')
        expect(dashboardApi.getDashboard).toHaveBeenCalledWith('2026-10')
    })

    it('opens the month picker from the month label', async () => {
        const user = userEvent.setup()
        renderPage('/?month=2026-09')

        await screen.findByText('September 2026')
        await user.click(screen.getByText('September 2026'))

        expect(screen.getByText('Choose month')).toBeInTheDocument()
    })
})
