import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '@components/ConfirmDialog'

describe('ConfirmDialog', () => {
    it('renders the message and a default "Confirm" label', () => {
        render(<ConfirmDialog message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />)

        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('renders a custom confirm label when provided', () => {
        render(
            <ConfirmDialog
                message="Delete this?"
                confirmLabel="Delete"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        )

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()
    })

    it('calls onConfirm when the confirm button is clicked', () => {
        const onConfirm = vi.fn()
        render(<ConfirmDialog message="Sure?" onConfirm={onConfirm} onCancel={() => {}} />)

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when the Cancel button is clicked', () => {
        const onCancel = vi.fn()
        render(<ConfirmDialog message="Sure?" onConfirm={() => {}} onCancel={onCancel} />)

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when the backdrop is clicked, via the underlying Modal', () => {
        const onCancel = vi.fn()
        const { container } = render(<ConfirmDialog message="Sure?" onConfirm={() => {}} onCancel={onCancel} />)

        fireEvent.mouseDown(container.firstChild)

        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})