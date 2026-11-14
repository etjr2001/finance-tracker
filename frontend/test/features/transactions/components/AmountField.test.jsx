import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AmountField } from '@features/transactions/components/AmountField'

function renderField(props = {}) {
    return render(<AmountField value="0" onChange={() => {}} {...props} />)
}

describe('AmountField help', () => {
    it('shows no (i) without help', () => {
        renderField({ helper: '0 shows as a Draft' })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('swaps the short helper for the full help under the input, and back', () => {
        renderField({ helper: '0 shows as a Draft', help: 'Enter 0 to save a Draft.' })
        const button = screen.getByRole('button', { name: 'About Amount' })

        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()
        expect(screen.queryByText('Enter 0 to save a Draft.')).not.toBeInTheDocument()

        fireEvent.click(button)
        const help = screen.getByText('Enter 0 to save a Draft.')
        expect(screen.queryByText('0 shows as a Draft')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Amount').compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

        fireEvent.click(button)
        expect(screen.getByText('0 shows as a Draft')).toBeInTheDocument()
        expect(screen.queryByText('Enter 0 to save a Draft.')).not.toBeInTheDocument()
    })

    it('shows the help even when there is no short helper (non-zero amount)', () => {
        renderField({ value: '12', help: 'Enter 0 to save a Draft.' })

        fireEvent.click(screen.getByRole('button', { name: 'About Amount' }))

        expect(screen.getByText('Enter 0 to save a Draft.')).toBeInTheDocument()
    })

    it('links the open help to the input and the (i)', () => {
        renderField({ help: 'Enter 0 to save a Draft.' })
        const button = screen.getByRole('button', { name: 'About Amount' })
        const input = screen.getByLabelText('Amount')

        expect(input).not.toHaveAttribute('aria-describedby')

        fireEvent.click(button)

        expect(screen.getByText('Enter 0 to save a Draft.')).toHaveAttribute('id', 'amount-help')
        expect(button).toHaveAttribute('aria-controls', 'amount-help')
        expect(input).toHaveAttribute('aria-describedby', 'amount-help')
    })

    it('keeps a validation hint visible while the help is open', () => {
        renderField({ hint: 'overMax', help: 'Enter 0 to save a Draft.' })

        fireEvent.click(screen.getByRole('button', { name: 'About Amount' }))

        expect(screen.getByText('Max amount is 9,999,999,999.99')).toBeInTheDocument()
        expect(screen.getByText('Enter 0 to save a Draft.')).toBeInTheDocument()
    })
})
