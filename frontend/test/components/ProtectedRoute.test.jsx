import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import { useAuth } from '../../src/context/useAuth'

vi.mock('../../src/context/useAuth')

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
        useAuth.mockReturnValue({ isAuthenticated: false, loading: false })
        renderAt('/')

        expect(await screen.findByText('Demo page')).toBeInTheDocument()
    })

    it('renders the protected content when authenticated', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, loading: false })
        renderAt('/')

        expect(screen.getByText('Protected page')).toBeInTheDocument()
    })
})
