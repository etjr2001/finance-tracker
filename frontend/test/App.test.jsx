import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from '@/App'
import { useAuth } from '@features/auth/hooks/useAuth'

// The real AuthProvider talks to Supabase; these tests only need routing.
vi.mock('@features/auth/context/AuthProvider', () => ({
    AuthProvider: ({ children }) => children,
}))
vi.mock('@features/auth/hooks/useAuth')

// Lets a test make the Dashboard page throw while rendering; otherwise it's
// the real page.
const dashboardCrash = vi.hoisted(() => ({ isOn: false }))
vi.mock('@features/dashboard/pages/DashboardPage', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        DashboardPage: (props) => {
            if (dashboardCrash.isOn) throw new Error('boom')
            return <actual.DashboardPage {...props} />
        },
    }
})

function renderApp(path) {
    const router = createMemoryRouter(routes, { initialEntries: [path] })
    render(
        <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    )
    return router
}

describe('App routes', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({ logout: vi.fn() })
        // jsdom has no View Transitions API: run the update straight away.
        document.startViewTransition = vi.fn((update) => {
            const done = Promise.resolve().then(update)
            return { ready: done, finished: done, updateCallbackDone: done, skipTransition: vi.fn() }
        })
    })

    afterEach(() => {
        delete document.startViewTransition
        dashboardCrash.isOn = false
        vi.restoreAllMocks()
    })

    // Regression guard: pages used to live in a descendant <Routes> under a
    // splat route, and React Router drops `viewTransition` for links there,
    // so the page crossfade and sliding nav highlight never ran.
    it('starts a view transition when a nav link is clicked', async () => {
        const user = userEvent.setup()
        const router = renderApp('/demo')

        const [link] = await screen.findAllByRole('link', { name: 'Categories' })
        await user.click(link)

        expect(document.startViewTransition).toHaveBeenCalled()
        await vi.waitFor(() => expect(router.state.location.pathname).toBe('/demo/categories'))
    })

    // Regression guard: with no errorElement, a crash showed React Router's
    // bare "Unexpected Application Error" page with no way out. A page that
    // throws now shows a proper error screen inside the layout, so the nav
    // stays usable.
    it('shows an error screen inside the layout when a page crashes, keeping the nav', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        dashboardCrash.isOn = true

        renderApp('/demo')

        expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
        expect(screen.getAllByRole('link', { name: 'Categories' }).length).toBeGreaterThan(0)
    })

    it('redirects unknown paths to /', async () => {
        const router = renderApp('/no-such-page')

        await vi.waitFor(() => expect(router.state.location.pathname).not.toBe('/no-such-page'))
    })
})
