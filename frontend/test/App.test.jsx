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

    it('redirects unknown paths to /', async () => {
        const router = renderApp('/no-such-page')

        await vi.waitFor(() => expect(router.state.location.pathname).not.toBe('/no-such-page'))
    })
})
