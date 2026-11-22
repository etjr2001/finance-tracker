import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CategoryEditModal } from '@features/categories/components/CategoryEditModal'

function renderModal(props = {}) {
    const handlers = { onSave: vi.fn(), onCancel: vi.fn() }
    render(
        <CategoryEditModal
            name="Groceries"
            onNameChange={() => {}}
            colorKey={null}
            onColorKeyChange={() => {}}
            iconKey={null}
            onIconKeyChange={() => {}}
            error={null}
            isSaving={false}
            {...handlers}
            {...props}
        />
    )
    return handlers
}

// The colour and icon grids make this modal taller than a small phone, so
// Save/Cancel live in the Modal's pinned footer, outside the scrolling body.
describe('CategoryEditModal footer', () => {
    it('keeps Save and Cancel out of the scrolling body', () => {
        renderModal()
        const body = screen.getByText('Edit category').closest('.overflow-y-auto')

        expect(body).not.toContainElement(screen.getByRole('button', { name: 'Save' }))
        expect(body).not.toContainElement(screen.getByRole('button', { name: 'Cancel' }))
        expect(body).toContainElement(screen.getByRole('button', { name: 'Close' }))
    })

    it('shows a save error next to Save, in the footer', () => {
        renderModal({ error: 'A category with that name already exists.' })
        const body = screen.getByText('Edit category').closest('.overflow-y-auto')

        expect(body).not.toContainElement(screen.getByText('A category with that name already exists.'))
    })

    it('still saves and cancels from the footer', async () => {
        const user = userEvent.setup()
        const { onSave, onCancel } = renderModal()

        await user.click(screen.getByRole('button', { name: 'Save' }))
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(onSave).toHaveBeenCalledTimes(1)
        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})
