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
                            <Route path="categories" element={<div>Categories page</div>} />
                        </Route>
                        <Route path="/demo" element={<Layout />}>
                            <Route index element={<div>Dashboard</div>} />
                            <Route path="transactions" element={<div>Transactions page</div>} />
                            <Route path="categories" element={<div>Categories page</div>} />
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

        expect(screen.getAllByRole('link', { name: 'Transactions' })[0]).toHaveAttribute('href', '/demo/transactions')
    })

    it('does not prefix nav links outside demo mode', () => {
        renderLayout({ isDemo: false, path: '/' })

        expect(screen.getAllByRole('link', { name: 'Transactions' })[0]).toHaveAttribute('href', '/transactions')
    })

    it('carries ?month= across month-scoped nav links (ADR0011)', () => {
        renderLayout({ isDemo: false, path: '/?month=2026-03' })

        expect(screen.getAllByRole('link', { name: 'Transactions' })[0]).toHaveAttribute(
            'href',
            '/transactions?month=2026-03'
        )
    })

    it('does not add ?month= to the Categories link, which is not month-scoped', () => {
        renderLayout({ isDemo: false, path: '/?month=2026-03' })

        expect(screen.getAllByRole('link', { name: 'Categories' })[0]).toHaveAttribute('href', '/categories')
    })

    // Regression guard: Dashboard and Transactions' `to` becomes an object
    // ({ pathname, search }) once ?month= is set, and keying NavLink by
    // `item.to` used to collapse both onto the same "[object Object]"
    // React key — duplicate keys confuse reconciliation and can leave a
    // stale nav icon in the DOM after navigating away (reported as "an
    // additional dashboard icon appears" when switching to Categories).
    it('gives every nav item a unique key even when ?month= makes `to` an object', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        renderLayout({ isDemo: false, path: '/?month=2026-03' })

        const duplicateKeyWarning = errorSpy.mock.calls.some((args) =>
            args.some((arg) => typeof arg === 'string' && arg.includes('same key'))
        )
        expect(duplicateKeyWarning).toBe(false)
    })
})
