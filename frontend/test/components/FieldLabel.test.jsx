import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FieldLabel } from '@components/FieldLabel'

describe('FieldLabel', () => {
    it('renders the label for its control', () => {
        render(
            <>
                <FieldLabel label="Amount" htmlFor="amount" />
                <input id="amount" />
            </>
        )

        expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('shows no (i) button without help', () => {
        render(<FieldLabel label="Amount" htmlFor="amount" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('hides the help at first, shows it on tap, and hides it on a second tap', () => {
        render(<FieldLabel label="Amount" htmlFor="amount" help="Enter 0 for a Draft." />)
        const button = screen.getByRole('button', { name: 'About Amount' })

        expect(screen.queryByText('Enter 0 for a Draft.')).not.toBeInTheDocument()

        fireEvent.click(button)
        expect(screen.getByText('Enter 0 for a Draft.')).toBeInTheDocument()

        fireEvent.click(button)
        expect(screen.queryByText('Enter 0 for a Draft.')).not.toBeInTheDocument()
    })

    it('reflects the open state in aria-expanded and points aria-controls at the help text', () => {
        render(<FieldLabel label="Amount" htmlFor="amount" help="Enter 0 for a Draft." />)
        const button = screen.getByRole('button', { name: 'About Amount' })

        expect(button).toHaveAttribute('aria-expanded', 'false')
        expect(button).toHaveAttribute('aria-controls', 'amount-help')

        fireEvent.click(button)

        expect(button).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Enter 0 for a Draft.')).toHaveAttribute('id', 'amount-help')
    })

    it('does not submit the surrounding form when the (i) is tapped', () => {
        const onSubmit = vi.fn((event) => event.preventDefault())
        render(
            <form onSubmit={onSubmit}>
                <FieldLabel label="Amount" htmlFor="amount" help="Enter 0 for a Draft." />
            </form>
        )

        fireEvent.click(screen.getByRole('button', { name: 'About Amount' }))

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('shows a live counter when maxLength is set', () => {
        render(<FieldLabel label="Note" htmlFor="note" maxLength={10} value="Hi" />)

        expect(screen.getByText('2/10')).toBeInTheDocument()
    })

    it('treats a missing value as empty for the counter', () => {
        render(<FieldLabel label="Note" htmlFor="note" maxLength={10} />)

        expect(screen.getByText('0/10')).toBeInTheDocument()
    })
})
