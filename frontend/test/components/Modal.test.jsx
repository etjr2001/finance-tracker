import { useState } from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Modal } from '@components/Modal'
import { ExitPresence } from '@components/ExitPresence'
import { EXIT_MS } from '@hooks/useIsExiting'

function renderModal(onRequestClose = () => {}, content = <div>content</div>) {
    const result = render(<Modal onRequestClose={onRequestClose}>{content}</Modal>)
    const dialog = screen.getByRole('dialog')
    return { ...result, dialog, backdrop: dialog.parentElement }
}

describe('Modal transitions', () => {
    const defaultMatchMedia = window.matchMedia

    afterEach(() => {
        window.matchMedia = defaultMatchMedia
        vi.useRealTimers()
    })

    // Reduced motion drops the pop (a zoom) but keeps the fades.
    it('fades in its backdrop and pops in, or only fades in under reduced motion', () => {
        const { dialog, backdrop } = renderModal()

        expect(backdrop).toHaveClass('animate-fade-in')
        expect(dialog).toHaveClass('motion-safe:animate-pop-in', 'motion-reduce:animate-fade-in')
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
        const { rerender } = render(<ExitPresence>{modal}</ExitPresence>)

        rerender(<ExitPresence>{false}</ExitPresence>)

        const dialog = screen.getByRole('dialog')
        const backdrop = dialog.parentElement
        expect(dialog).toHaveClass('motion-safe:animate-pop-out', 'motion-reduce:animate-fade-out')
        expect(backdrop).toHaveClass('animate-fade-out', 'pointer-events-none')

        fireEvent.mouseDown(backdrop)
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
        const { dialog } = renderModal()

        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveTextContent('content')
    })

    // Outside the app's own tree, so the page behind can be made inert.
    it('renders into <body>, outside the tree it was rendered from', () => {
        const { container, backdrop } = renderModal()

        expect(container).not.toContainElement(backdrop)
        expect(backdrop.parentElement).toBe(document.body)
    })

    it('makes the page behind inert while open, and moves focus into the dialog', () => {
        const { container, dialog } = renderModal()

        expect(container).toHaveAttribute('inert')
        expect(dialog).toHaveFocus()
    })

    it('calls onRequestClose when the backdrop is clicked', () => {
        const onRequestClose = vi.fn()
        const { backdrop } = renderModal(onRequestClose)

        fireEvent.mouseDown(backdrop)

        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onRequestClose when clicking inside the content', () => {
        const onRequestClose = vi.fn()
        renderModal(onRequestClose, <button>Inside</button>)

        fireEvent.mouseDown(screen.getByText('Inside'))

        expect(onRequestClose).not.toHaveBeenCalled()
    })

    // React events bubble through portals: a click on a stacked dialog's
    // backdrop must not also count as an outside click on this one.
    it('ignores a backdrop click on a Modal stacked over it', () => {
        const onOuterClose = vi.fn()
        const onInnerClose = vi.fn()
        function Stack() {
            const [isInnerOpen, setIsInnerOpen] = useState(false)
            return (
                <Modal onRequestClose={onOuterClose}>
                    <button onClick={() => setIsInnerOpen(true)}>Open inner</button>
                    {isInnerOpen && (
                        <Modal onRequestClose={onInnerClose}>
                            <div>inner</div>
                        </Modal>
                    )}
                </Modal>
            )
        }
        render(<Stack />)
        fireEvent.click(screen.getByText('Open inner'))

        fireEvent.mouseDown(screen.getByText('inner').closest('[role="dialog"]').parentElement)

        expect(onInnerClose).toHaveBeenCalledTimes(1)
        expect(onOuterClose).not.toHaveBeenCalled()
    })

    it('calls onRequestClose on Escape', () => {
        const onRequestClose = vi.fn()
        renderModal(onRequestClose)

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onRequestClose).toHaveBeenCalledTimes(1)
    })

    it('does not respond to other keys', () => {
        const onRequestClose = vi.fn()
        renderModal(onRequestClose)

        fireEvent.keyDown(document, { key: 'Enter' })

        expect(onRequestClose).not.toHaveBeenCalled()
    })

    it('removes its Escape listener, inert and scroll lock on unmount', () => {
        const onRequestClose = vi.fn()
        const { unmount, container } = renderModal(onRequestClose)

        unmount()
        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onRequestClose).not.toHaveBeenCalled()
        expect(container).not.toHaveAttribute('inert')
        expect(document.body.style.overflow).toBe('')
    })
})
