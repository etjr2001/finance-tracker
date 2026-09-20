import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../src/components/Modal'

describe('Modal', () => {
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