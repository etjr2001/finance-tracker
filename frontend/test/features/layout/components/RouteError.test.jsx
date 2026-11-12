import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { RouteError } from '@features/layout/components/RouteError'

function Crash() {
    throw new Error('boom')
}

// A route that always throws, with RouteError as its errorElement.
function renderCrashAt(path, props = {}) {
    const router = createMemoryRouter(
        [{ path: '*', element: <Crash />, errorElement: <RouteError {...props} /> }],
        { initialEntries: [path] }
    )
    render(<RouterProvider router={router} />)
}

describe('RouteError', () => {
    let reload
    let assign

    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        reload = vi.fn()
        assign = vi.fn()
        vi.stubGlobal('location', { ...window.location, reload, assign })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('reloads the page from the Reload button', async () => {
        const user = userEvent.setup()
        renderCrashAt('/transactions')

        await user.click(await screen.findByRole('button', { name: 'Reload' }))

        expect(reload).toHaveBeenCalled()
    })

    it('shows the error message in development', async () => {
        renderCrashAt('/transactions')

        expect(await screen.findByText('boom')).toBeInTheDocument()
    })

    it('has no Go to Dashboard inside the layout, where the nav already is', async () => {
        renderCrashAt('/transactions')

        await screen.findByRole('heading', { name: 'Something went wrong' })
        expect(screen.queryByRole('button', { name: 'Go to Dashboard' })).not.toBeInTheDocument()
    })

    it('links the full-page version back to the Dashboard', async () => {
        const user = userEvent.setup()
        renderCrashAt('/transactions', { isFullPage: true })

        await user.click(await screen.findByRole('button', { name: 'Go to Dashboard' }))

        expect(assign).toHaveBeenCalledWith('/')
    })

    it('keeps a demo User in demo mode', async () => {
        const user = userEvent.setup()
        renderCrashAt('/demo/transactions', { isFullPage: true })

        await user.click(await screen.findByRole('button', { name: 'Go to Dashboard' }))

        expect(assign).toHaveBeenCalledWith('/demo')
    })
})
