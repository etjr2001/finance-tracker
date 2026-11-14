import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavouriteDetail } from '@features/favourites/components/FavouriteDetail'

const favourite = {
    id: 1,
    type: 'EXPENSE',
    amount: 4.5,
    note: 'Kopi',
    category: { id: 1, name: 'Dining Out' },
}

function renderDetail(props = {}) {
    return render(
        <FavouriteDetail favourite={favourite} onClose={() => {}} onEdit={() => {}} onDelete={() => {}} {...props} />
    )
}

describe('FavouriteDetail content', () => {
    it('names it by its note, with Category and type underneath', () => {
        renderDetail()

        expect(screen.getByText('Kopi')).toBeInTheDocument()
        expect(screen.getByText('Dining Out · Expense')).toBeInTheDocument()
    })

    it('names it by its Category when there is no note, with just the type underneath', () => {
        renderDetail({ favourite: { ...favourite, note: null } })

        expect(screen.getByText('Dining Out')).toBeInTheDocument()
        expect(screen.getByText('Expense')).toBeInTheDocument()
        expect(screen.queryByText('Dining Out · Expense')).not.toBeInTheDocument()
    })

    it('shows the signed amount', () => {
        renderDetail()

        expect(screen.getByText('$4.50').parentElement).toHaveTextContent('−$4.50')
    })

    it('labels income as Income', () => {
        renderDetail({ favourite: { ...favourite, type: 'INCOME' } })

        expect(screen.getByText('Dining Out · Income')).toBeInTheDocument()
        expect(screen.getByText('$4.50').parentElement).toHaveTextContent('+$4.50')
    })

    it('shows "No amount" for a zero amount, like the list', () => {
        renderDetail({ favourite: { ...favourite, amount: 0 } })

        expect(screen.getByText('No amount')).toBeInTheDocument()
        expect(screen.queryByText('$0.00')).not.toBeInTheDocument()
    })

    it('does not repeat the note as a separate line', () => {
        renderDetail()

        expect(screen.getAllByText('Kopi')).toHaveLength(1)
    })

    it('has no star (Favourites are not starred) and no Use button', () => {
        renderDetail()

        expect(screen.queryByRole('button', { name: /favourite/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /use/i })).not.toBeInTheDocument()
    })
})

describe('FavouriteDetail actions', () => {
    it('calls onEdit, onDelete and onClose', () => {
        const onEdit = vi.fn()
        const onDelete = vi.fn()
        const onClose = vi.fn()
        renderDetail({ onEdit, onDelete, onClose })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
