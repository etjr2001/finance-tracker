import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormModal } from '@components/FormModal'

describe('FormModal', () => {
    it('shows the form with no error message when there is no error', () => {
        render(
            <FormModal error={null} onRequestClose={() => {}}>
                <p>the form</p>
            </FormModal>,
        )
        expect(screen.getByRole('dialog')).toHaveTextContent('the form')
        expect(screen.queryByText(/failed/i)).not.toBeInTheDocument()
    })

    it('shows the error above the form', () => {
        render(
            <FormModal error="Save failed" onRequestClose={() => {}}>
                <p>the form</p>
            </FormModal>,
        )
        const dialog = screen.getByRole('dialog')
        expect(dialog.textContent.indexOf('Save failed')).toBeLessThan(dialog.textContent.indexOf('the form'))
    })
})
