import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { ExitPresence } from '@components/ExitPresence'
import { MonthPicker } from '@features/month/components/MonthPicker'
import { currentMonth, formatMonth, shiftMonth } from '@utils/date'

// "This month" reset, only shown when viewing another month (ADR0011).
// Its text hides below sm: to leave room for whatever shares the row; the
// icon plus aria-label keeps it usable.
// Tap target: a full 44px-wide button pushed Add off narrow phones, so
// below sm: the button is only w-7 (28px) and an invisible ::before
// stretches the hit area 8px each side to 44×44. 8px is exactly the
// bar's gap-2, so it never overlaps the Next arrow. sm:+ has room: the
// text shows and the button sizes to it.
function ThisMonthButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="This month"
            className="relative inline-flex h-11 w-7 sm:w-auto items-center justify-center gap-1.5 sm:px-2 text-sm text-ink-soft hover:text-ink shrink-0 before:absolute before:inset-y-0 before:-inset-x-2 sm:before:hidden"
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
    const closePicker = useCallback(() => setIsPickerOpen(false), [])

    function selectMonth(value) {
        onChange(value)
        setIsPickerOpen(false)
    }

    // relative: MonthPicker anchors its md:+ popover here, left-aligned with
    // the bar. inline-flex (not flex) so the bar shrink-wraps in any parent
    // and the popover lines up with the bar itself, not a full-width box.
    return (
        <div className="relative inline-flex items-center gap-2">
            {/* ring, not border: a border adds to this wrapper's auto height on
                top of its 44px children, rendering 2px taller than Button
                elsewhere; a ring is a box-shadow and doesn't affect layout size. */}
            <div className="flex items-center ring-1 ring-inset ring-rule-strong bg-white rounded-xl overflow-hidden">
                <IconButton icon={ChevronLeft} label="Previous month" onClick={() => onChange(shiftMonth(month, -1))} />
                {/* min-w keeps the arrows still as the label changes. 8rem
                    below sm: still fits the widest label ("September 2026")
                    and pays back the extra width "This month" needs. */}
                <button onClick={() => setIsPickerOpen(true)} className="h-11 px-2 min-w-32 sm:min-w-36 text-sm font-medium text-center">
                    {formatMonth(month)}
                </button>
                <IconButton icon={ChevronRight} label="Next month" onClick={() => onChange(shiftMonth(month, 1))} />
            </div>

            {!isCurrentMonth && <ThisMonthButton onClick={() => onChange(currentMonth())} />}

            <ExitPresence>
                {isPickerOpen && <MonthPicker month={month} onSelect={selectMonth} onClose={closePicker} />}
            </ExitPresence>
        </div>
    )
}
