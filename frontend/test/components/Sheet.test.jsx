import { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Sheet } from '@components/Sheet'
import { ExitPresence } from '@components/ExitPresence'
import { EXIT_MS } from '@hooks/useIsExiting'

// The global test/setup.js matchMedia polyfill matches every query: desktop,
// with reduced motion on. Sheet's swipe-to-close is mobile-only, so these
// tests switch to a mobile viewport with motion on (or off, when asked).
const defaultMatchMedia = window.matchMedia
function mockViewport({ isDesktop = false, isReducedMotion = false } = {}) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('min-width') ? isDesktop : query.includes('reduce') && isReducedMotion,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }))
}

function renderSheet(onRequestClose = vi.fn()) {
    render(
        <Sheet onRequestClose={onRequestClose}>
            <p>Sheet body</p>
            <button type="button">Inner button</button>
        </Sheet>
    )
    return { onRequestClose, panel: screen.getByRole('dialog') }
}

// A Sheet whose parent closes it on request, inside ExitPresence, as callers
// use it.
function renderClosableSheet() {
    const onRequestClose = vi.fn()
    function Harness() {
        const [isOpen, setIsOpen] = useState(true)
        return (
            <ExitPresence>
                {isOpen && (
                    <Sheet
                        onRequestClose={() => {
                            onRequestClose()
                            setIsOpen(false)
                        }}
                    >
                        <p>Sheet body</p>
                    </Sheet>
                )}
            </ExitPresence>
        )
    }
    render(<Harness />)
    return { onRequestClose, panel: screen.getByRole('dialog') }
}

function finishExit() {
    act(() => vi.advanceTimersByTime(EXIT_MS))
}

function swipe(target, fromY, toY) {
    fireEvent.pointerDown(target, { clientY: fromY, pointerId: 1 })
    fireEvent.pointerMove(target, { clientY: toY, pointerId: 1 })
    fireEvent.pointerUp(target, { clientY: toY, pointerId: 1 })
}

describe('Sheet', () => {
    afterEach(() => {
        window.matchMedia = defaultMatchMedia
        vi.useRealTimers()
    })

    it('renders its content in a dialog', () => {
        renderSheet()

        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
        expect(screen.getByText('Sheet body')).toBeInTheDocument()
    })

    it('requests close on a backdrop click but not on a click inside', () => {
        const { onRequestClose, panel } = renderSheet()

        fireEvent.mouseDown(screen.getByText('Sheet body'))
        expect(onRequestClose).not.toHaveBeenCalled()

        fireEvent.mouseDown(panel.parentElement)
        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('requests close on Escape', () => {
        const { onRequestClose } = renderSheet()

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('respects the bottom safe area on mobile', () => {
        const { panel } = renderSheet()

        expect(panel.className).toContain('env(safe-area-inset-bottom)')
    })

    it('slides up on mobile and pops in on desktop, or only fades in under reduced motion', () => {
        const { panel } = renderSheet()

        expect(panel).toHaveClass('motion-safe:animate-sheet-up', 'md:motion-safe:animate-pop-in', 'motion-reduce:animate-fade-in')
        expect(panel.parentElement).toHaveClass('animate-fade-in')
    })

    describe('on mobile, under reduced motion', () => {
        it('fades out in place instead of sliding down', () => {
            vi.useFakeTimers()
            mockViewport({ isReducedMotion: true })
            const { panel } = renderClosableSheet()

            fireEvent.keyDown(document, { key: 'Escape' })

            expect(panel).toHaveClass('animate-fade-out')
            expect(panel.style.transform).toBe('')
            finishExit()
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('still follows the finger, then fades out from where it let go', () => {
            vi.useFakeTimers()
            mockViewport({ isReducedMotion: true })
            const { onRequestClose, panel } = renderClosableSheet()

            swipe(panel, 100, 220)

            expect(onRequestClose).toHaveBeenCalledTimes(1)
            expect(panel.style.transform).toBe('translateY(120px)')
            expect(panel).toHaveClass('animate-fade-out')
        })

        it('snaps back instantly on a short swipe', () => {
            mockViewport({ isReducedMotion: true })
            const { panel } = renderSheet()

            swipe(panel, 100, 140)

            expect(panel.style.transform).toBe('')
            expect(panel.style.transition).toBe('none')
        })
    })

    describe('on mobile', () => {
        it('requests close on a swipe down past the threshold', () => {
            mockViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 220)

            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('slides down from where the finger let go, then is removed, inside ExitPresence', () => {
            vi.useFakeTimers()
            mockViewport()
            const { onRequestClose, panel } = renderClosableSheet()

            swipe(panel, 100, 220)

            expect(onRequestClose).toHaveBeenCalledTimes(1)
            expect(panel).toBeInTheDocument()
            expect(panel.style.transform).toBe('translateY(100%)')
            expect(panel.parentElement).toHaveClass('animate-fade-out', 'pointer-events-none')
            finishExit()
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('ignores further close requests while sliding down', () => {
            vi.useFakeTimers()
            mockViewport()
            const { onRequestClose, panel } = renderClosableSheet()

            fireEvent.keyDown(document, { key: 'Escape' })
            fireEvent.mouseDown(panel.parentElement)
            fireEvent.keyDown(document, { key: 'Escape' })

            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('springs back on a short swipe without closing', () => {
            mockViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 140)

            expect(onRequestClose).not.toHaveBeenCalled()
            expect(panel.style.transform).toBe('')
        })

        it('ignores upward swipes', () => {
            mockViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 300, 100)

            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('does not start a swipe from a button, so taps stay taps', () => {
            mockViewport()
            const { onRequestClose } = renderSheet()

            swipe(screen.getByRole('button', { name: 'Inner button' }), 100, 300)

            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('follows the finger while dragging', () => {
            mockViewport()
            const { panel } = renderSheet()

            fireEvent.pointerDown(panel, { clientY: 100, pointerId: 1 })
            fireEvent.pointerMove(panel, { clientY: 150, pointerId: 1 })

            expect(panel.style.transform).toBe('translateY(50px)')
        })
    })

    describe('on desktop', () => {
        it('does not swipe-close, since it is a centred modal', () => {
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 400)

            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('pops out like Modal inside ExitPresence, instead of sliding', () => {
            vi.useFakeTimers()
            mockViewport({ isDesktop: true })
            const { panel } = renderClosableSheet()

            fireEvent.keyDown(document, { key: 'Escape' })

            expect(panel).toHaveClass('motion-safe:animate-pop-out', 'motion-reduce:animate-fade-out')
            expect(panel.style.transform).toBe('')
            finishExit()
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
