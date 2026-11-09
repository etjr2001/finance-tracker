import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthPicker } from '@features/month/components/MonthPicker'

describe('MonthPicker', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('shows the year of the given month', () => {
        render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

        expect(screen.getByText('2026')).toBeInTheDocument()
    })

    it('calls onSelect with the clicked month', () => {
        const onSelect = vi.fn()
        render(<MonthPicker month="2026-09" onSelect={onSelect} onClose={() => {}} />)

        fireEvent.click(screen.getByRole('button', { name: 'Jul' }))

        expect(onSelect).toHaveBeenCalledWith('2026-07')
    })

    it('navigates to the previous/next year without changing the selected month', () => {
        render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

        fireEvent.click(screen.getByRole('button', { name: 'Previous year' }))
        expect(screen.getByText('2025')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Next year' }))
        fireEvent.click(screen.getByRole('button', { name: 'Next year' }))
        expect(screen.getByText('2027')).toBeInTheDocument()
    })

    it('calls onSelect with the current month when "Back to this month" is clicked', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 8, 15))

        const onSelect = vi.fn()
        render(<MonthPicker month="2026-03" onSelect={onSelect} onClose={() => {}} />)

        fireEvent.click(screen.getByText('Back to this month'))

        expect(onSelect).toHaveBeenCalledWith('2026-09')
    })

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn()
        render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={onClose} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the backdrop is clicked', () => {
        const onClose = vi.fn()
        const { container } = render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={onClose} />)

        fireEvent.click(container.firstChild)

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on Escape', () => {
        const onClose = vi.fn()
        render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={onClose} />)

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('centres the "Choose month" heading', () => {
        render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

        expect(screen.getByRole('heading', { name: 'Choose month' })).toHaveClass('text-center')
    })

    // The global test/setup.js matchMedia polyfill reports desktop.
    describe('on desktop', () => {
        it('opens as a popover aligned to the left edge of the month bar', () => {
            render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

            const popover = screen.getByRole('dialog')
            expect(popover).toHaveClass('left-0')
            expect(popover).not.toHaveClass('right-0')
        })

        it('pops in from its top-left corner', () => {
            render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

            expect(screen.getByRole('dialog')).toHaveClass('motion-safe:animate-pop-in', 'origin-top-left')
        })
    })

    describe('on mobile', () => {
        const desktopMatchMedia = window.matchMedia

        beforeEach(() => {
            window.matchMedia = vi.fn().mockImplementation(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        })

        afterEach(() => {
            window.matchMedia = desktopMatchMedia
        })

        // Sheet is the shared bottom card: slide-up, swipe-to-close, backdrop.
        it('opens in the shared bottom Sheet', () => {
            render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={() => {}} />)

            expect(screen.getByRole('dialog')).toHaveClass('motion-safe:animate-sheet-up')
        })

        it('closes once on Escape, not once per layer', () => {
            const onClose = vi.fn()
            render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={onClose} />)

            fireEvent.keyDown(document, { key: 'Escape' })

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('closes on a backdrop tap', () => {
            const onClose = vi.fn()
            render(<MonthPicker month="2026-09" onSelect={() => {}} onClose={onClose} />)

            fireEvent.mouseDown(screen.getByRole('dialog').parentElement)

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })
})
