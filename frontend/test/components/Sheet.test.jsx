import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Sheet, SHEET_EXIT_MS } from '@components/Sheet'

// The global test/setup.js matchMedia polyfill reports desktop. Sheet's
// swipe-to-close is mobile-only, so these tests switch to mobile.
const desktopMatchMedia = window.matchMedia
function mockMobileViewport() {
    window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
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

// Mobile closes wait for the slide-down before reporting the close.
function finishExit() {
    act(() => vi.advanceTimersByTime(SHEET_EXIT_MS))
}

function swipe(target, fromY, toY) {
    fireEvent.pointerDown(target, { clientY: fromY, pointerId: 1 })
    fireEvent.pointerMove(target, { clientY: toY, pointerId: 1 })
    fireEvent.pointerUp(target, { clientY: toY, pointerId: 1 })
}

describe('Sheet', () => {
    afterEach(() => {
        window.matchMedia = desktopMatchMedia
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

    describe('on mobile', () => {
        it('slides down, then closes, on a swipe down past the threshold', () => {
            vi.useFakeTimers()
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 220)

            expect(onRequestClose).not.toHaveBeenCalled()
            expect(panel.style.transform).toBe('translateY(100%)')
            finishExit()
            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('slides down, then closes, on Escape', () => {
            vi.useFakeTimers()
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            fireEvent.keyDown(document, { key: 'Escape' })

            expect(onRequestClose).not.toHaveBeenCalled()
            expect(panel.style.transform).toBe('translateY(100%)')
            finishExit()
            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('ignores further close requests while sliding down', () => {
            vi.useFakeTimers()
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            fireEvent.mouseDown(panel.parentElement)
            fireEvent.keyDown(document, { key: 'Escape' })
            finishExit()

            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('passes close() to function children: slides down, then runs the given callback', () => {
            vi.useFakeTimers()
            mockMobileViewport()
            const onRequestClose = vi.fn()
            const afterClose = vi.fn()
            render(
                <Sheet onRequestClose={onRequestClose}>
                    {({ close }) => (
                        <button type="button" onClick={() => close(afterClose)}>
                            Pick
                        </button>
                    )}
                </Sheet>
            )

            fireEvent.click(screen.getByRole('button', { name: 'Pick' }))

            expect(afterClose).not.toHaveBeenCalled()
            finishExit()
            expect(afterClose).toHaveBeenCalledTimes(1)
            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('closes straight away when the phone asks for reduced motion', () => {
            window.matchMedia = vi.fn().mockImplementation((query) => ({
                matches: query.includes('reduce'),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
            const { onRequestClose } = renderSheet()

            fireEvent.keyDown(document, { key: 'Escape' })

            expect(onRequestClose).toHaveBeenCalledTimes(1)
        })

        it('springs back on a short swipe without closing', () => {
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 140)

            expect(onRequestClose).not.toHaveBeenCalled()
            expect(panel.style.transform).toBe('')
        })

        it('ignores upward swipes', () => {
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 300, 100)

            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('does not start a swipe from a button, so taps stay taps', () => {
            mockMobileViewport()
            const { onRequestClose } = renderSheet()

            swipe(screen.getByRole('button', { name: 'Inner button' }), 100, 300)

            expect(onRequestClose).not.toHaveBeenCalled()
        })

        it('follows the finger while dragging', () => {
            mockMobileViewport()
            const { panel } = renderSheet()

            fireEvent.pointerDown(panel, { clientY: 100, pointerId: 1 })
            fireEvent.pointerMove(panel, { clientY: 150, pointerId: 1 })

            expect(panel.style.transform).toBe('translateY(50px)')
        })
    })

    it('does not swipe-close on desktop, where it is a centred modal', () => {
        const { onRequestClose, panel } = renderSheet()

        swipe(panel, 100, 400)

        expect(onRequestClose).not.toHaveBeenCalled()
    })
})
