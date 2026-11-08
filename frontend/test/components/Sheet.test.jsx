import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sheet } from '@components/Sheet'

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

function swipe(target, fromY, toY) {
    fireEvent.pointerDown(target, { clientY: fromY, pointerId: 1 })
    fireEvent.pointerMove(target, { clientY: toY, pointerId: 1 })
    fireEvent.pointerUp(target, { clientY: toY, pointerId: 1 })
}

describe('Sheet', () => {
    afterEach(() => {
        window.matchMedia = desktopMatchMedia
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
        it('closes on a swipe down past the threshold', () => {
            mockMobileViewport()
            const { onRequestClose, panel } = renderSheet()

            swipe(panel, 100, 220)

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
