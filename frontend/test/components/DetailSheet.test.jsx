import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailSheet } from '@components/DetailSheet'

function renderSheet(props = {}) {
    return render(
        <DetailSheet
            tile={<span data-testid="tile" />}
            title="Groceries"
            amount={<span>$12.50</span>}
            meta="Wed 23 Sep · Expense"
            onClose={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            {...props}
        />
    )
}

describe('DetailSheet content', () => {
    it('shows the tile, title, amount, meta line and note', () => {
        renderSheet({ note: 'Weekly shop' })

        expect(screen.getByTestId('tile')).toBeInTheDocument()
        expect(screen.getByText('Groceries')).toBeInTheDocument()
        expect(screen.getByText('$12.50')).toBeInTheDocument()
        expect(screen.getByText('Wed 23 Sep · Expense')).toBeInTheDocument()
        expect(screen.getByText('Weekly shop')).toBeInTheDocument()
    })

    it('renders no note line without a note', () => {
        const { container } = renderSheet()

        expect(container.ownerDocument.querySelectorAll('[role="dialog"] p')).toHaveLength(0)
    })

    it('puts extra header actions before Close', () => {
        renderSheet({ headerActions: <button type="button">Star</button> })

        const star = screen.getByRole('button', { name: 'Star' })
        const close = screen.getByRole('button', { name: 'Close' })
        expect(star.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
})

describe('DetailSheet actions', () => {
    it('stacks Edit above Delete, both full width', () => {
        renderSheet()

        const edit = screen.getByRole('button', { name: 'Edit' })
        const remove = screen.getByRole('button', { name: 'Delete' })
        expect(edit).toHaveClass('w-full')
        expect(remove).toHaveClass('w-full')
        expect(edit.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('calls onEdit and onDelete', () => {
        const onEdit = vi.fn()
        const onDelete = vi.fn()
        renderSheet({ onEdit, onDelete })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('calls onClose from the ✕ button and from the backdrop', () => {
        const onClose = vi.fn()
        renderSheet({ onClose })

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        // Sheet renders into <body>; the backdrop wraps the dialog.
        fireEvent.mouseDown(screen.getByRole('dialog').parentElement)

        expect(onClose).toHaveBeenCalledTimes(2)
    })
})
