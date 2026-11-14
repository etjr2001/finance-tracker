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

    it('shows no (i) button without onToggleHelp', () => {
        render(<FieldLabel label="Amount" htmlFor="amount" />)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onToggleHelp when the (i) is tapped', () => {
        const onToggleHelp = vi.fn()
        render(<FieldLabel label="Amount" htmlFor="amount" helpId="amount-help" onToggleHelp={onToggleHelp} />)

        fireEvent.click(screen.getByRole('button', { name: 'About Amount' }))

        expect(onToggleHelp).toHaveBeenCalledTimes(1)
    })

    it('reflects isHelpOpen in aria-expanded and points aria-controls at helpId', () => {
        const { rerender } = render(
            <FieldLabel label="Amount" htmlFor="amount" helpId="amount-help" onToggleHelp={() => {}} />
        )
        const button = screen.getByRole('button', { name: 'About Amount' })

        expect(button).toHaveAttribute('aria-expanded', 'false')
        expect(button).toHaveAttribute('aria-controls', 'amount-help')

        rerender(<FieldLabel label="Amount" htmlFor="amount" helpId="amount-help" isHelpOpen onToggleHelp={() => {}} />)

        expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('does not submit the surrounding form when the (i) is tapped', () => {
        const onSubmit = vi.fn((event) => event.preventDefault())
        render(
            <form onSubmit={onSubmit}>
                <FieldLabel label="Amount" htmlFor="amount" helpId="amount-help" onToggleHelp={() => {}} />
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
