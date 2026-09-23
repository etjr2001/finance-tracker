import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DemoBanner from '../../src/demo/DemoBanner'
import * as demoApi from '../../src/demo/demoApi'

vi.mock('../../src/demo/demoApi')

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

    it('resets demo data and invalidates the demo query caches', async () => {
        const user = userEvent.setup()
        const queryClient = renderBanner()

        await user.click(screen.getByRole('button', { name: 'Reset demo data' }))

        expect(demoApi.resetDemoData).toHaveBeenCalled()
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['transactions', true] })
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories', true] })
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboard', true] })
    })

    it('links to /login and /signup', () => {
        renderBanner()

        expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
        expect(screen.getByRole('link', { name: 'sign up' })).toHaveAttribute('href', '/signup')
    })
})
