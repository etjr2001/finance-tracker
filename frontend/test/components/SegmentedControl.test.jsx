import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SegmentedControl } from '@components/SegmentedControl'

const OPTIONS = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
]

describe('SegmentedControl', () => {
    it('renders one control per option with the given labels', () => {
        render(<SegmentedControl options={OPTIONS} value="a" onChange={() => {}} />)

        expect(screen.getByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('Beta')).toBeInTheDocument()
    })

    it('clicking anywhere in the control toggles to the next option, regardless of which label was clicked', () => {
        const onChange = vi.fn()
        const { rerender } = render(<SegmentedControl options={OPTIONS} value="a" onChange={onChange} />)

        // Clicking the currently-selected label still toggles away from it —
        // the whole field is one toggle, not per-option targets.
        screen.getByText('Alpha').click()
        expect(onChange).toHaveBeenLastCalledWith('b')

        rerender(<SegmentedControl options={OPTIONS} value="b" onChange={onChange} />)
        screen.getByText('Alpha').click()
        expect(onChange).toHaveBeenLastCalledWith('a')
    })

    it('cycles back to the first option after the last', () => {
        const onChange = vi.fn()
        render(<SegmentedControl options={OPTIONS} value="b" onChange={onChange} />)

        screen.getByRole('radiogroup').click()

        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('toggles on Enter and Space when the control has focus', () => {
        const onChange = vi.fn()
        render(<SegmentedControl options={OPTIONS} value="a" onChange={onChange} />)
        const control = screen.getByRole('radiogroup')

        fireEvent.keyDown(control, { key: 'Enter' })
        expect(onChange).toHaveBeenLastCalledWith('b')

        fireEvent.keyDown(control, { key: ' ' })
        expect(onChange).toHaveBeenLastCalledWith('b')
    })

    it('is a single tab stop', () => {
        render(<SegmentedControl options={OPTIONS} value="a" onChange={() => {}} />)

        expect(screen.getByRole('radiogroup')).toHaveAttribute('tabIndex', '0')
    })

    it('defaults to radiogroup/radio roles and marks the selected option checked', () => {
        render(<SegmentedControl options={OPTIONS} value="b" ariaLabel="Choice" onChange={() => {}} />)

        expect(screen.getByRole('radiogroup', { name: 'Choice' })).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'false')
        expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true')
    })

    it('uses tablist/tab roles when role="tablist" is passed', () => {
        render(<SegmentedControl options={OPTIONS} value="a" ariaLabel="View" role="tablist" onChange={() => {}} />)

        expect(screen.getByRole('tablist', { name: 'View' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false')
    })

    it('applies the given fill class to the container', () => {
        render(<SegmentedControl options={OPTIONS} value="a" onChange={() => {}} fillClassName="bg-ink" />)

        expect(screen.getByRole('radiogroup')).toHaveClass('bg-ink')
    })
})
