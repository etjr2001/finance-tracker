import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormField } from '@components/FormField'

describe('FormField', () => {
    it('associates the label with the input via htmlFor/id', () => {
        render(<FormField label="Email" htmlFor="email" />)

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('shows helper text under the input only when given', () => {
        const { rerender } = render(<FormField label="Note" htmlFor="note" helper="Shown in the list" />)
        expect(screen.getByText('Shown in the list')).toBeInTheDocument()

        rerender(<FormField label="Note" htmlFor="note" />)
        expect(screen.queryByText('Shown in the list')).not.toBeInTheDocument()
    })

    it('passes extra props through to the input', () => {
        const onChange = vi.fn()
        render(<FormField label="Email" htmlFor="email" type="email" value="" onChange={onChange} />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    })

    it('renders custom children instead of the default input when provided', () => {
        render(
            <FormField label="Category" htmlFor="category">
                <select id="category">
                    <option>Groceries</option>
                </select>
            </FormField>
        )

        expect(screen.getByLabelText('Category').tagName).toBe('SELECT')
    })

    it('shows a live character counter when maxLength is set', () => {
        render(<FormField label="Note" htmlFor="note" maxLength={10} value="Hi" onChange={() => {}} />)

        expect(screen.getByText('2/10')).toBeInTheDocument()
    })

    it('treats a missing value as empty for the counter', () => {
        render(<FormField label="Note" htmlFor="note" maxLength={10} onChange={() => {}} />)

        expect(screen.getByText('0/10')).toBeInTheDocument()
    })

    it('toggles help text under the input with the (i)', () => {
        render(<FormField label="Note" htmlFor="note" help="Names the favourite." />)
        const button = screen.getByRole('button', { name: 'About Note' })

        expect(screen.queryByText('Names the favourite.')).not.toBeInTheDocument()

        fireEvent.click(button)
        const help = screen.getByText('Names the favourite.')
        expect(screen.getByLabelText('Note').compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

        fireEvent.click(button)
        expect(screen.queryByText('Names the favourite.')).not.toBeInTheDocument()
    })

    it('links the open help to the input and the (i)', () => {
        render(<FormField label="Note" htmlFor="note" help="Names the favourite." />)
        const button = screen.getByRole('button', { name: 'About Note' })
        const input = screen.getByLabelText('Note')

        expect(input).not.toHaveAttribute('aria-describedby')

        fireEvent.click(button)

        expect(screen.getByText('Names the favourite.')).toHaveAttribute('id', 'note-help')
        expect(button).toHaveAttribute('aria-controls', 'note-help')
        expect(input).toHaveAttribute('aria-describedby', 'note-help')
    })

    it('shows help in place of helper while open', () => {
        render(<FormField label="Note" htmlFor="note" helper="Short" help="The full explanation." />)

        expect(screen.getByText('Short')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'About Note' }))

        expect(screen.queryByText('Short')).not.toBeInTheDocument()
        expect(screen.getByText('The full explanation.')).toBeInTheDocument()
    })

    it('shows no counter when maxLength is not set', () => {
        render(<FormField label="Email" htmlFor="email" value="" onChange={() => {}} />)

        expect(screen.queryByText(/\/\d/)).not.toBeInTheDocument()
    })
})
