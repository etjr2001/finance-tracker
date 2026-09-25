import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { MonthGrid } from '@features/month/components/MonthGrid'
import { useEscapeKey } from '@hooks/useEscapeKey'
import { currentMonth } from '@utils/date'

// Month-grid picker opened from MonthBar's label (ADR0011) — our own
// component, since native month inputs are uneven across desktop browsers.
// Below md: a bottom sheet; md:+ a popover under the trigger. Same
// component, positioned with responsive classes.
export function MonthPicker({ month, onSelect, onClose }) {
    const [year, setYear] = useState(() => Number(month.split('-')[0]))
    useEscapeKey(onClose)

    return (
        <>
            {/* Dims the page below md: (sheet); md:+ it's only an invisible
                outside-click catcher for the popover. */}
            <div className="fixed inset-0 z-40 bg-black/45 md:bg-transparent" onClick={onClose} />

            {/* Single-property side utilities only: inset-x-0 + inset-x-auto
                would both set `right`, and Tailwind's stylesheet order (not
                source order) would decide the winner. */}
            <div className="fixed left-0 right-0 bottom-0 z-50 md:absolute md:left-auto md:bottom-auto md:top-full md:right-0 md:mt-2 md:w-72">
                <div className="rounded-t-[14px] md:rounded-[14px] bg-paper-raised shadow-xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif font-semibold text-lg">Choose month</h3>
                        <IconButton icon={X} label="Close" onClick={onClose} iconSize="h-5 w-5" className="-mr-2 -mt-2" />
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <IconButton icon={ChevronLeft} label="Previous year" onClick={() => setYear((y) => y - 1)} />
                        <span className="font-medium tabular">{year}</span>
                        <IconButton icon={ChevronRight} label="Next year" onClick={() => setYear((y) => y + 1)} />
                    </div>

                    <MonthGrid year={year} selectedMonth={month} onSelect={onSelect} />

                    <button
                        onClick={() => onSelect(currentMonth())}
                        className="w-full h-11 rounded-xl border border-rule text-sm text-deposit hover:opacity-70 transition-opacity"
                    >
                        Back to this month
                    </button>
                </div>
            </div>
        </>
    )
}
