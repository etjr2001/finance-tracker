import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../../src/pages/LoginPage'
import { useAuth } from '../../src/context/useAuth'

vi.mock('../../src/context/useAuth')

describe('LoginPage', () => {
    it('links back to the demo', () => {
        useAuth.mockReturnValue({ login: vi.fn() })
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('link', { name: 'Back to demo' })).toHaveAttribute('href', '/demo')
    })
})
