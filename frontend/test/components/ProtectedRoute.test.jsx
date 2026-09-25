import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute'
import { useAuth } from '@features/auth/hooks/useAuth'

vi.mock('@features/auth/hooks/useAuth')

function renderAt(path) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/demo" element={<div>Demo page</div>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<div>Protected page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    )
}

describe('ProtectedRoute', () => {
    it('redirects an unauthenticated visit to /demo, not /login', async () => {
        useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })
        renderAt('/')

        expect(await screen.findByText('Demo page')).toBeInTheDocument()
    })

    it('renders the protected content when authenticated', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
        renderAt('/')

        expect(screen.getByText('Protected page')).toBeInTheDocument()
    })
})
