import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { MonthPicker } from '@features/month/components/MonthPicker'
import { currentMonth, formatMonth, shiftMonth } from '@utils/date'

// "This month" reset, only shown when viewing another month (ADR0011).
// Its text hides below sm: to leave room for whatever shares the row; the
// icon plus aria-label keeps it usable.
function ThisMonthButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            aria-label="This month"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink shrink-0"
        >
            <RotateCcw aria-hidden="true" strokeWidth={1.7} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">This month</span>
        </button>
    )
}

// Previous/next + a centred label that opens MonthPicker (ADR0011).
export function MonthBar({ month, onChange }) {
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const isCurrentMonth = month === currentMonth()
    // Stable identity so MonthPicker's Escape listener isn't re-bound every render.
    const closePicker = useCallback(() => setIsPickerOpen(false), [])

    function selectMonth(value) {
        onChange(value)
        setIsPickerOpen(false)
    }

    // relative: MonthPicker anchors its md:+ popover here. inline-flex (not
    // flex) so the bar shrink-wraps in any parent; a block-level flex box
    // would stretch full-width and push the popover's right-0 off-screen.
    return (
        <div className="relative inline-flex items-center gap-2">
            <div className="flex items-center border border-rule-strong bg-white rounded-xl overflow-hidden">
                <IconButton icon={ChevronLeft} label="Previous month" onClick={() => onChange(shiftMonth(month, -1))} />
                <button onClick={() => setIsPickerOpen(true)} className="h-11 px-2 min-w-36 text-sm font-medium text-center">
                    {formatMonth(month)}
                </button>
                <IconButton icon={ChevronRight} label="Next month" onClick={() => onChange(shiftMonth(month, 1))} />
            </div>

            {!isCurrentMonth && <ThisMonthButton onClick={() => onChange(currentMonth())} />}

            {isPickerOpen && <MonthPicker month={month} onSelect={selectMonth} onClose={closePicker} />}
        </div>
    )
}
