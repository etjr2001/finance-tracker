import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '../../src/pages/DashboardPage'
import * as dashboardApi from '../../src/api/dashboard'

vi.mock('../../src/api/dashboard')

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <DashboardPage />
        </QueryClientProvider>
    )
}

describe('DashboardPage month picker', () => {
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

    it('opens the native month picker on click anywhere in the field', async () => {
        const showPicker = vi.fn()
        HTMLInputElement.prototype.showPicker = showPicker

        const user = userEvent.setup()
        const { container } = renderPage()

        await screen.findByText('Dashboard')
        const monthInput = container.querySelector('input[type="month"]')
        await user.click(monthInput)

        expect(showPicker).toHaveBeenCalledTimes(1)
    })
})