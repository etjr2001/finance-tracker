import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StaleContent } from '@components/StaleContent'

describe('StaleContent', () => {
    it('dims its content and marks it busy while stale', () => {
        render(<StaleContent isStale>Old month</StaleContent>)

        const wrapper = screen.getByText('Old month')
        expect(wrapper).toHaveAttribute('aria-busy', 'true')
        expect(wrapper).toHaveClass('opacity-50')
    })

    it('shows its content normally once current', () => {
        render(<StaleContent isStale={false}>New month</StaleContent>)

        const wrapper = screen.getByText('New month')
        expect(wrapper).toHaveAttribute('aria-busy', 'false')
        expect(wrapper).not.toHaveClass('opacity-50')
    })
})
