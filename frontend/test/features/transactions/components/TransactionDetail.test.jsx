import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionDetail } from '@features/transactions/components/TransactionDetail'

const transaction = {
    id: 1,
    type: 'EXPENSE',
    amount: 12.5,
    date: '2026-09-23',
    note: 'Weekly shop',
    category: { id: 1, name: 'Groceries' },
}

function renderDetail(props = {}) {
    return render(
        <TransactionDetail
            transaction={transaction}
            onClose={() => {}}
            onFavouriteClick={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            {...props}
        />
    )
}

describe('TransactionDetail content', () => {
    it('shows the category, amount, date with type, and note', () => {
        renderDetail()

        expect(screen.getByText('Groceries')).toBeInTheDocument()
        expect(screen.getByText('$12.50')).toBeInTheDocument()
        expect(screen.getByText('Wed 23 Sep · Expense')).toBeInTheDocument()
        expect(screen.getByText('Weekly shop')).toBeInTheDocument()
    })

    it('shows an expense in ink with a minus sign, not in red', () => {
        renderDetail()

        const amount = screen.getByText('$12.50').parentElement
        expect(amount).toHaveTextContent('−$12.50')
        expect(amount).toHaveClass('text-ink')
        expect(amount).not.toHaveClass('text-withdrawal')
    })

    it('shows income in green with a plus sign, labelled Income', () => {
        renderDetail({ transaction: { ...transaction, type: 'INCOME' } })

        const amount = screen.getByText('$12.50').parentElement
        expect(amount).toHaveTextContent('+$12.50')
        expect(amount).toHaveClass('text-deposit')
        expect(screen.getByText('Wed 23 Sep · Income')).toBeInTheDocument()
    })

    it('shows a Draft label for a 0-amount transaction', () => {
        renderDetail({ transaction: { ...transaction, amount: 0 } })

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('hides the note line when there is none', () => {
        renderDetail({ transaction: { ...transaction, note: '' } })

        expect(screen.queryByText('Weekly shop')).not.toBeInTheDocument()
    })
})

describe('TransactionDetail star', () => {
    it('is an outline "Save as favourite" when the transaction matches no Favourite', () => {
        renderDetail()

        const star = screen.getByRole('button', { name: 'Save as favourite' })
        expect(star.querySelector('svg')).toHaveAttribute('fill', 'none')
    })

    it('is a filled "Saved as favourite" when it matches one', () => {
        renderDetail({ isSavedAsFavourite: true })

        const star = screen.getByRole('button', { name: 'Saved as favourite' })
        expect(star.querySelector('svg')).toHaveAttribute('fill', 'currentColor')
    })

    it('hands the click to the page in either state', () => {
        const onFavouriteClick = vi.fn()
        renderDetail({ onFavouriteClick, isSavedAsFavourite: true })

        fireEvent.click(screen.getByRole('button', { name: 'Saved as favourite' }))

        expect(onFavouriteClick).toHaveBeenCalledTimes(1)
    })
})

describe('TransactionDetail actions', () => {
    it('stacks Edit above Delete, both full width', () => {
        renderDetail()

        const edit = screen.getByRole('button', { name: 'Edit' })
        const remove = screen.getByRole('button', { name: 'Delete' })
        expect(edit).toHaveClass('w-full')
        expect(remove).toHaveClass('w-full')
        expect(edit.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('calls onEdit and onDelete', () => {
        const onEdit = vi.fn()
        const onDelete = vi.fn()
        renderDetail({ onEdit, onDelete })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('calls onClose from the ✕ button and from the backdrop', () => {
        const onClose = vi.fn()
        renderDetail({ onClose })

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        // Sheet renders into <body>; the backdrop wraps the dialog.
        fireEvent.mouseDown(screen.getByRole('dialog').parentElement)

        expect(onClose).toHaveBeenCalledTimes(2)
    })
})
