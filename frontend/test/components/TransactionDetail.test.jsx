import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TransactionDetail from '../../src/components/TransactionDetail'

const transaction = {
    id: 1,
    type: 'EXPENSE',
    amount: 12.5,
    date: '2026-09-23',
    note: 'Weekly shop',
    category: { id: 1, name: 'Groceries' },
}

describe('TransactionDetail', () => {
    it('shows the category, formatted date, amount, and note', () => {
        render(<TransactionDetail transaction={transaction} onClose={() => {}} onEdit={() => {}} onDelete={() => {}} />)

        expect(screen.getByText('Groceries')).toBeInTheDocument()
        expect(screen.getByText('Wed 23 Sep')).toBeInTheDocument()
        expect(screen.getByText('Weekly shop')).toBeInTheDocument()
        expect(screen.getByText('$12.50')).toBeInTheDocument()
    })

    it('shows a Draft badge for a 0-amount transaction', () => {
        render(
            <TransactionDetail
                transaction={{ ...transaction, amount: 0 }}
                onClose={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        )

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('does not show a note paragraph when there is none', () => {
        render(
            <TransactionDetail
                transaction={{ ...transaction, note: '' }}
                onClose={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        )

        expect(screen.queryByText('Weekly shop')).not.toBeInTheDocument()
    })

    it('calls onEdit when Edit is clicked', () => {
        const onEdit = vi.fn()
        render(<TransactionDetail transaction={transaction} onClose={() => {}} onEdit={onEdit} onDelete={() => {}} />)

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

        expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onDelete when Delete is clicked', () => {
        const onDelete = vi.fn()
        render(<TransactionDetail transaction={transaction} onClose={() => {}} onEdit={() => {}} onDelete={onDelete} />)

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the close (X) button is clicked', () => {
        const onClose = vi.fn()
        render(<TransactionDetail transaction={transaction} onClose={onClose} onEdit={() => {}} onDelete={() => {}} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the backdrop is clicked', () => {
        const onClose = vi.fn()
        const { container } = render(
            <TransactionDetail transaction={transaction} onClose={onClose} onEdit={() => {}} onDelete={() => {}} />
        )

        fireEvent.mouseDown(container.firstChild)

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
