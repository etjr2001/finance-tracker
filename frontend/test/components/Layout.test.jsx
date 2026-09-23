import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '../../src/components/Layout'
import { DemoModeContext } from '../../src/demo/DemoModeContext'
import { useAuth } from '../../src/context/useAuth'

vi.mock('../../src/context/useAuth')

function renderLayout({ isDemo = false, path = '/' } = {}) {
    useAuth.mockReturnValue({ logout: vi.fn() })
    const queryClient = new QueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <DemoModeContext.Provider value={isDemo}>
                    <Routes>
                        <Route path="/login" element={<div>Login page</div>} />
                        <Route path="/" element={<Layout />}>
                            <Route index element={<div>Dashboard</div>} />
                            <Route path="transactions" element={<div>Transactions page</div>} />
                        </Route>
                        <Route path="/demo" element={<Layout />}>
                            <Route index element={<div>Dashboard</div>} />
                            <Route path="transactions" element={<div>Transactions page</div>} />
                        </Route>
                    </Routes>
                </DemoModeContext.Provider>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('Layout logout / exit-demo button', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows "Log out" and calls logout() outside demo mode', async () => {
        const logout = vi.fn()
        useAuth.mockReturnValue({ logout })
        const user = userEvent.setup()
        render(
            <MemoryRouter initialEntries={['/']}>
                <DemoModeContext.Provider value={false}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<div>Dashboard</div>} />
                        </Route>
                    </Routes>
                </DemoModeContext.Provider>
            </MemoryRouter>
        )

        const buttons = screen.getAllByRole('button', { name: 'Log out' })
        await user.click(buttons[0])

        expect(logout).toHaveBeenCalled()
    })

    it('shows "Exit demo", navigates to /login, and does not call logout() in demo mode', async () => {
        const logout = vi.fn()
        useAuth.mockReturnValue({ logout })
        const user = userEvent.setup()
        renderLayout({ isDemo: true, path: '/demo' })

        const buttons = screen.getAllByRole('button', { name: 'Exit demo' })
        await user.click(buttons[0])

        expect(logout).not.toHaveBeenCalled()
        expect(await screen.findByText('Login page')).toBeInTheDocument()
    })

    it('prefixes nav links with /demo in demo mode', () => {
        renderLayout({ isDemo: true, path: '/demo' })

        expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute('href', '/demo/transactions')
    })

    it('does not prefix nav links outside demo mode', () => {
        renderLayout({ isDemo: false, path: '/' })

        expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute('href', '/transactions')
    })
})
