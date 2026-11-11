import { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ExitPresence } from '@components/ExitPresence'
import { useIsExiting, EXIT_MS } from '@hooks/useIsExiting'

function Probe({ label }) {
    const isExiting = useIsExiting()
    return <p>{`${label}${isExiting ? ' (exiting)' : ''}`}</p>
}

function renderPresence(isOpen, label = 'Popup') {
    return render(<ExitPresence>{isOpen && <Probe label={label} />}</ExitPresence>)
}

describe('ExitPresence', () => {
    const defaultMatchMedia = window.matchMedia

    // test/setup.js's polyfill matches every query, reduced motion included;
    // these tests need motion on.
    beforeEach(() => {
        window.matchMedia = vi.fn().mockImplementation(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
        vi.useFakeTimers()
    })

    afterEach(() => {
        window.matchMedia = defaultMatchMedia
        vi.useRealTimers()
    })

    it('renders its children while they are present, not marked as exiting', () => {
        renderPresence(true)

        expect(screen.getByText('Popup')).toBeInTheDocument()
    })

    it('renders nothing when there were never any children', () => {
        const { container } = renderPresence(false)

        expect(container).toBeEmptyDOMElement()
    })

    it('keeps the last children, marked as exiting, for EXIT_MS after they go away', () => {
        const { rerender } = renderPresence(true)

        rerender(<ExitPresence>{false}</ExitPresence>)
        expect(screen.getByText('Popup (exiting)')).toBeInTheDocument()

        act(() => vi.advanceTimersByTime(EXIT_MS))
        expect(screen.queryByText(/Popup/)).not.toBeInTheDocument()
    })

    it('keeps the same component instance during the exit, so its state survives', () => {
        function Counter() {
            const [count] = useState(() => Math.random())
            return <p data-testid="value">{count}</p>
        }
        const { rerender } = render(<ExitPresence>{<Counter />}</ExitPresence>)
        const before = screen.getByTestId('value').textContent

        rerender(<ExitPresence>{false}</ExitPresence>)

        expect(screen.getByTestId('value').textContent).toBe(before)
    })

    it('shows new children straight away if reopened mid-exit', () => {
        const { rerender } = renderPresence(true)

        rerender(<ExitPresence>{false}</ExitPresence>)
        rerender(<ExitPresence>{<Probe label="Again" />}</ExitPresence>)
        act(() => vi.advanceTimersByTime(EXIT_MS))

        expect(screen.getByText('Again')).toBeInTheDocument()
    })

    // Reduced motion is about movement, not fades: popups still fade out, so
    // they still need their exit time.
    it('still keeps the last children for their exit when the device asks for reduced motion', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: query.includes('reduce'),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
        const { rerender } = renderPresence(true)

        rerender(<ExitPresence>{false}</ExitPresence>)
        expect(screen.getByText('Popup (exiting)')).toBeInTheDocument()

        act(() => vi.advanceTimersByTime(EXIT_MS))
        expect(screen.queryByText(/Popup/)).not.toBeInTheDocument()
    })
})
