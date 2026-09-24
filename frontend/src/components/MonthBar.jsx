import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import MonthPicker from './MonthPicker'
import { currentMonth, formatMonth, shiftMonth } from '../lib/date'

// Previous/next + a centred label that opens MonthPicker, plus a "This
// month" reset that only appears when viewing a different month (ADR0011).
export default function MonthBar({ month, onChange }) {
    const [pickerOpen, setPickerOpen] = useState(false)

    function selectMonth(value) {
        onChange(value)
        setPickerOpen(false)
    }

    return (
        // relative: MonthPicker anchors its md:+ popover to this element.
        // inline-flex, not flex: a `flex` container is still a block-level
        // box (width:auto = fills its parent), so when MonthBar sits in a
        // plain block parent (Dashboard) rather than as a flex item
        // (Transactions), it silently stretched to the full ~1100px
        // content width — invisible, but MonthPicker's right-0 then
        // anchored to that box's true (far-off) right edge instead of the
        // visible pill. inline-flex shrink-wraps to content regardless of
        // what kind of parent wraps it.
        <div className="relative inline-flex items-center gap-2">
            <div className="flex items-center border border-rule-strong bg-white rounded-xl overflow-hidden">
                <button
                    onClick={() => onChange(shiftMonth(month, -1))}
                    aria-label="Previous month"
                    className="h-11 w-11 shrink-0 flex items-center justify-center text-ink-soft hover:text-ink"
                >
                    <ChevronLeft aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setPickerOpen(true)}
                    className="h-11 px-2 min-w-36 text-sm font-medium text-center"
                >
                    {formatMonth(month)}
                </button>
                <button
                    onClick={() => onChange(shiftMonth(month, 1))}
                    aria-label="Next month"
                    className="h-11 w-11 shrink-0 flex items-center justify-center text-ink-soft hover:text-ink"
                >
                    <ChevronRight aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                </button>
            </div>

            {month !== currentMonth() && (
                <button
                    onClick={() => onChange(currentMonth())}
                    aria-label="This month"
                    className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink shrink-0"
                >
                    <RotateCcw aria-hidden="true" strokeWidth={1.7} className="h-3.5 w-3.5" />
                    {/* Text hidden below sm: to leave room for whatever
                        else shares this row (e.g. Transactions' Add
                        button) on a narrow screen. The icon alone, plus
                        aria-label, keeps the control usable. */}
                    <span className="hidden sm:inline">This month</span>
                </button>
            )}

            {pickerOpen && (
                <MonthPicker month={month} onSelect={selectMonth} onClose={() => setPickerOpen(false)} />
            )}
        </div>
    )
}
