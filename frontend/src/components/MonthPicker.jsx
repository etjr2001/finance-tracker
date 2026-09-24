import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_ABBR, currentMonth } from '../lib/date'

// Month-grid picker, opened from MonthBar's label (ADR0011). Our own
// component, not the native month input, whose support/styling is uneven
// across desktop browsers. Below md: a bottom sheet; at md: and up, a
// popover anchored under the trigger — same component, positioned with
// responsive classes rather than two separate implementations.
export default function MonthPicker({ month, onSelect, onClose }) {
    const [year, setYear] = useState(Number(month.split('-')[0]))

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    return (
        <>
            {/* Dims the page below md: (sheet, like any other modal); at
                md: and up it's just an invisible outside-click catcher for
                the popover, not a dimmed backdrop. */}
            <div className="fixed inset-0 z-40 bg-black/45 md:bg-transparent" onClick={onClose} />

            {/* Single-property side utilities only, not inset-x-0 +
                inset-x-auto: both would set `right`, and which one wins is
                decided by Tailwind's generated stylesheet order, not the
                order written here — the same footgun Card's padding hit. */}
            <div className="fixed left-0 right-0 bottom-0 z-50 md:absolute md:left-auto md:bottom-auto md:top-full md:right-0 md:mt-2 md:w-72">
                <div className="rounded-t-[14px] md:rounded-[14px] bg-paper-raised shadow-xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif font-semibold text-lg">Choose month</h3>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="h-11 w-11 -mr-2 -mt-2 shrink-0 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                        >
                            <X aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setYear((y) => y - 1)}
                            aria-label="Previous year"
                            className="h-11 w-11 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                        >
                            <ChevronLeft aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                        </button>
                        <span className="font-medium tabular">{year}</span>
                        <button
                            onClick={() => setYear((y) => y + 1)}
                            aria-label="Next year"
                            className="h-11 w-11 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                        >
                            <ChevronRight aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {MONTH_ABBR.map((label, i) => {
                            const value = `${year}-${String(i + 1).padStart(2, '0')}`
                            const isSelected = value === month
                            const isCurrent = value === currentMonth()
                            return (
                                <button
                                    key={value}
                                    onClick={() => onSelect(value)}
                                    className={`h-11 rounded-xl text-sm font-medium transition-colors ${
                                        isSelected
                                            ? 'bg-deposit text-paper'
                                            : isCurrent
                                              ? 'border border-deposit text-deposit'
                                              : 'bg-paper text-ink hover:bg-track'
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>

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
