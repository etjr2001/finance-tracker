import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Modal } from '@components/Modal'
import { ExitPresence } from '@components/ExitPresence'
import { EXIT_MS } from '@hooks/useIsExiting'

describe('Modal transitions', () => {
    const defaultMatchMedia = window.matchMedia

    afterEach(() => {
        window.matchMedia = defaultMatchMedia
        vi.useRealTimers()
    })

    it('fades and pops in when it opens', () => {
        const { container } = render(
            <Modal onRequestClose={() => {}}>
                <div>content</div>
            </Modal>
        )

        expect(container.firstChild).toHaveClass('motion-safe:animate-fade-in')
        expect(screen.getByRole('dialog')).toHaveClass('motion-safe:animate-pop-in')
    })

    // Inside ExitPresence, a closed Modal lingers briefly to animate out.
    it('animates out when closed inside ExitPresence, ignoring further close requests meanwhile', () => {
        window.matchMedia = vi.fn().mockImplementation(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
        vi.useFakeTimers()
        const onRequestClose = vi.fn()
        const modal = (
            <Modal onRequestClose={onRequestClose}>
                <div>content</div>
            </Modal>
        )
        const { container, rerender } = render(<ExitPresence>{modal}</ExitPresence>)

        rerender(<ExitPresence>{false}</ExitPresence>)

        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveClass('animate-pop-out')
        expect(container.firstChild).toHaveClass('animate-fade-out', 'pointer-events-none')

        fireEvent.mouseDown(container.firstChild)
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(onRequestClose).not.toHaveBeenCalled()

        act(() => vi.advanceTimersByTime(EXIT_MS))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})

describe('Modal', () => {
    // Like Sheet: screen readers announce it as a dialog and treat the page
    // behind as inactive.
    it('renders its content in a modal dialog', () => {
        render(
            <Modal onRequestClose={() => {}}>
                <div>content</div>
            </Modal>
        )

        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveTextContent('content')
    })

    it('calls onRequestClose when the backdrop is clicked', () => {
        const onRequestClose = vi.fn()
        const { container } = render(
            <Modal onRequestClose={onRequestClose}>
                <div>content</div>
            </Modal>
        )

        fireEvent.mouseDown(container.firstChild)

        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onRequestClose when clicking inside the content', () => {
        const onRequestClose = vi.fn()
        render(
            <Modal onRequestClose={onRequestClose}>
                <button>Inside</button>
            </Modal>
        )

        fireEvent.mouseDown(screen.getByText('Inside'))

        expect(onRequestClose).not.toHaveBeenCalled()
    })

    it('calls onRequestClose on Escape', () => {
        const onRequestClose = vi.fn()
        render(
            <Modal onRequestClose={onRequestClose}>
                <div>content</div>
            </Modal>
        )

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('does not respond to other keys', () => {
        const onRequestClose = vi.fn()
        render(
            <Modal onRequestClose={onRequestClose}>
                <div>content</div>
            </Modal>
        )

        fireEvent.keyDown(document, { key: 'Enter' })

        expect(onRequestClose).not.toHaveBeenCalled()
    })

    it('removes its Escape listener on unmount', () => {
        const onRequestClose = vi.fn()
        const { unmount } = render(
            <Modal onRequestClose={onRequestClose}>
                <div>content</div>
            </Modal>
        )

        unmount()
        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onRequestClose).not.toHaveBeenCalled()
    })
})