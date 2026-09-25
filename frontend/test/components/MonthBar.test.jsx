import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthBar } from '@features/month/components/MonthBar'

describe('MonthBar', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('shows the formatted month', () => {
        render(<MonthBar month="2026-09" onChange={() => {}} />)

        expect(screen.getByText('September 2026')).toBeInTheDocument()
    })

    // Regression guard: `flex` (not `inline-flex`) is still a block-level
    // box, which stretches to fill a plain block parent's full width
    // (Dashboard wraps MonthBar in one) even though it visually looks
    // content-sized — and MonthPicker's `right-0` then anchors to that
    // invisible far edge instead of the visible pill, landing the popover
    // far from the button. jsdom can't assert the resulting layout itself
    // (no real rendering engine), so this locks in the class that prevents
    // it structurally.
    it('shrink-wraps to its own content (inline-flex, not flex) so MonthPicker anchors correctly regardless of what kind of parent wraps it', () => {
        render(<MonthBar month="2026-09" onChange={() => {}} />)

        const root = screen.getByText('September 2026').closest('.relative')
        expect(root).toHaveClass('inline-flex')
        expect(root).not.toHaveClass('flex')
    })

    it('calls onChange with the previous month', () => {
        const onChange = vi.fn()
        render(<MonthBar month="2026-09" onChange={onChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))

        expect(onChange).toHaveBeenCalledWith('2026-08')
    })

    it('calls onChange with the next month', () => {
        const onChange = vi.fn()
        render(<MonthBar month="2026-09" onChange={onChange} />)

        fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

        expect(onChange).toHaveBeenCalledWith('2026-10')
    })

    it('does not show "This month" when already viewing the current month', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 8, 15))

        render(<MonthBar month="2026-09" onChange={() => {}} />)

        expect(screen.queryByText('This month')).not.toBeInTheDocument()
    })

    it('shows "This month" and resets when viewing a different month', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 8, 15))

        const onChange = vi.fn()
        render(<MonthBar month="2026-03" onChange={onChange} />)

        const resetButton = screen.getByText('This month')
        fireEvent.click(resetButton)

        expect(onChange).toHaveBeenCalledWith('2026-09')
    })

    it('opens the month picker when the label is clicked', () => {
        render(<MonthBar month="2026-09" onChange={() => {}} />)

        fireEvent.click(screen.getByText('September 2026'))

        expect(screen.getByText('Choose month')).toBeInTheDocument()
    })
})
