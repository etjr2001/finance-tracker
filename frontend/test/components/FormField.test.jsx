import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormField } from '@components/FormField'

describe('FormField', () => {
    it('associates the label with the input via htmlFor/id', () => {
        render(<FormField label="Email" htmlFor="email" />)

        expect(screen.getByLabelText('Email')).toBeInTheDocument()
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

    it('shows no counter when maxLength is not set', () => {
        render(<FormField label="Email" htmlFor="email" value="" onChange={() => {}} />)

        expect(screen.queryByText(/\/\d/)).not.toBeInTheDocument()
    })
})
