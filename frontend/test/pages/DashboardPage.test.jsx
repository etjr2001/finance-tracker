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

describe('DashboardPage Net card', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows Income, Expenses, and a signed Net figure', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 4200,
            totalExpenses: 1865.87,
            net: 2334.13,
            byCategory: [],
        })

        renderPage()

        expect(await screen.findByText('Net this month')).toBeInTheDocument()
        expect(screen.getByText('$4,200.00')).toBeInTheDocument()
        expect(screen.getByText('$1,865.87')).toBeInTheDocument()
        expect(screen.getByText('$2,334.13')).toBeInTheDocument()
    })

    it('renders a negative Net with U+2212, not a hyphen-minus', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 908.37,
            totalExpenses: 1865.87,
            net: -957.5,
            byCategory: [],
        })

        renderPage()

        expect(await screen.findByText('−$957.50')).toBeInTheDocument()
    })

    it('labels the category breakdown "Spending by category"', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 0,
            totalExpenses: 0,
            net: 0,
            byCategory: [],
        })

        renderPage()

        expect(await screen.findByText('Spending by category')).toBeInTheDocument()
    })

    it('shows what percentage of income went to expenses', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 4200,
            totalExpenses: 1050,
            net: 3150,
            byCategory: [],
        })

        renderPage()

        expect(await screen.findByText('25% of income')).toBeInTheDocument()
    })

    it('uses expenses as the 100% bar baseline when expenses exceed income, not income capped at 100%', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 650,
            totalExpenses: 1900.09,
            net: -1250.09,
            byCategory: [],
        })

        const { container } = renderPage()
        await screen.findByText('Net this month')

        const incomeBar = container.querySelector('.bg-deposit')
        const expenseBar = container.querySelector('.bg-withdrawal')
        expect(expenseBar.style.width).toBe('100%')
        // 650 / 1900.09 ≈ 34.2%
        expect(parseFloat(incomeBar.style.width)).toBeCloseTo(34.2, 1)
    })

    it('uses income as the 100% bar baseline when income exceeds expenses', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 4200,
            totalExpenses: 1050,
            net: 3150,
            byCategory: [],
        })

        const { container } = renderPage()
        await screen.findByText('Net this month')

        const incomeBar = container.querySelector('.bg-deposit')
        const expenseBar = container.querySelector('.bg-withdrawal')
        expect(incomeBar.style.width).toBe('100%')
        expect(expenseBar.style.width).toBe('25%')
    })

    it('shows a dash for "of income" when there is no income', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 0,
            totalExpenses: 50,
            net: -50,
            byCategory: [],
        })

        renderPage()

        expect(await screen.findByText('—')).toBeInTheDocument()
    })

    it('shows each category row with a percentage of the category total', async () => {
        dashboardApi.getDashboard.mockResolvedValue({
            totalIncome: 0,
            totalExpenses: 300,
            net: -300,
            byCategory: [
                { categoryId: 1, categoryName: 'Rent', total: 225 },
                { categoryId: 2, categoryName: 'Groceries', total: 75 },
            ],
        })

        renderPage()

        expect(await screen.findByText('75%')).toBeInTheDocument()
        expect(screen.getByText('25%')).toBeInTheDocument()
    })
})
