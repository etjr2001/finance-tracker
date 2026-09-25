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
})
