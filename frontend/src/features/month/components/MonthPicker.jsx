import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { SectionTitle } from '@components/SectionTitle'
import { Sheet } from '@components/Sheet'
import { useIsExiting } from '@hooks/useIsExiting'
import { MonthGrid } from '@features/month/components/MonthGrid'
import { useEscapeKey } from '@hooks/useEscapeKey'
import { useIsMobile } from '@hooks/useIsMobile'
import { currentMonth } from '@utils/date'

// Month-grid picker opened from MonthBar's label (ADR0011): our own
// component, since native month inputs are uneven across desktop browsers.
// Below md: the shared bottom Sheet (slide up/down, swipe-to-close,
// backdrop). md:+ a popover under the month bar, left-aligned with it,
// popping in from that corner. MonthBar renders it inside ExitPresence, so
// both animate out too.
export function MonthPicker({ month, onSelect, onClose }) {
    const isMobile = useIsMobile()
    const content = <MonthPickerContent month={month} onSelect={onSelect} onClose={onClose} />

    if (isMobile) return <Sheet onRequestClose={onClose}>{content}</Sheet>
    return <MonthPopover onClose={onClose}>{content}</MonthPopover>
}

// md:+ only. Sheet handles Escape itself on mobile, so only this branch
// registers it: both doing so would close twice per keypress.
function MonthPopover({ onClose, children }) {
    const isExiting = useIsExiting()
    function requestClose() {
        if (!isExiting) onClose()
    }
    useEscapeKey(requestClose)

    return (
        <>
            {/* Invisible outside-click catcher. */}
            <div className="fixed inset-0 z-40" onClick={requestClose} />

            {/* Anchored to MonthBar's relative wrapper. */}
            <div
                role="dialog"
                className={`absolute left-0 top-full z-50 mt-2 w-72 origin-top-left rounded-[14px] bg-paper-raised p-5 shadow-xl ${
                    isExiting
                        ? 'motion-safe:animate-pop-out motion-reduce:animate-fade-out pointer-events-none'
                        : 'motion-safe:animate-pop-in motion-reduce:animate-fade-in'
                }`}
            >
                {children}
            </div>
        </>
    )
}

function MonthPickerContent({ month, onSelect, onClose }) {
    const [year, setYear] = useState(() => Number(month.split('-')[0]))

    return (
        <>
            {/* Three columns so the heading centres on the panel, not on the
                space left beside the Close button. */}
            <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center mb-4">
                <SectionTitle as="h3" className="col-start-2 text-center">
                    Choose month
                </SectionTitle>
                <IconButton
                    icon={X}
                    label="Close"
                    onClick={onClose}
                    iconSize="h-5 w-5"
                    className="col-start-3 justify-self-end -mr-2"
                />
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
        </>
    )
}
