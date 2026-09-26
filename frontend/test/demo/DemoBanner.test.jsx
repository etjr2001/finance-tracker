import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DemoBanner } from '@features/demo/components/DemoBanner'
import * as demoApi from '@features/demo/api/demoApi'

vi.mock('@features/demo/api/demoApi')

function renderBanner() {
    const queryClient = new QueryClient()
    vi.spyOn(queryClient, 'invalidateQueries')
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <DemoBanner />
            </MemoryRouter>
        </QueryClientProvider>
    )
    return queryClient
}

describe('DemoBanner reset', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('asks for confirmation before resetting', async () => {
        const user = userEvent.setup()
        renderBanner()

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }))

        expect(demoApi.resetDemoData).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })

    it('resets demo data and invalidates the demo query caches once confirmed', async () => {
        const user = userEvent.setup()
        const queryClient = renderBanner()

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }))
        await user.click(screen.getByRole('button', { name: 'Reset' }))

        expect(demoApi.resetDemoData).toHaveBeenCalled()
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['transactions', true] })
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories', true] })
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboard', true] })
    })

    it('does not reset when cancelled', async () => {
        const user = userEvent.setup()
        renderBanner()

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }))
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(demoApi.resetDemoData).not.toHaveBeenCalled()
        expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
    })

    it('links to /login and /signup', () => {
        renderBanner()

        expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
        expect(screen.getByRole('link', { name: 'sign up' })).toHaveAttribute('href', '/signup')
    })
})
