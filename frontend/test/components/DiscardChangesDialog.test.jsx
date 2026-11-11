import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiscardChangesDialog } from '@components/DiscardChangesDialog'

describe('DiscardChangesDialog', () => {
    it('asks to discard unsaved changes and wires both buttons', async () => {
        const onConfirm = vi.fn()
        const onCancel = vi.fn()
        render(<DiscardChangesDialog onConfirm={onConfirm} onCancel={onCancel} />)

        expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
        expect(onConfirm).toHaveBeenCalledOnce()
        await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
        expect(onCancel).toHaveBeenCalledOnce()
    })
})
