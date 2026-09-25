import { MONTH_ABBR, currentMonth, toMonthValue } from '@utils/date'

function monthCellClass(isSelected, isCurrent) {
    if (isSelected) return 'bg-deposit text-paper'
    if (isCurrent) return 'border border-deposit text-deposit'
    return 'bg-paper text-ink hover:bg-track'
}

export function MonthGrid({ year, selectedMonth, onSelect }) {
    const thisMonth = currentMonth()

    return (
        <div className="grid grid-cols-3 gap-2 mb-4">
            {MONTH_ABBR.map((label, monthIndex) => {
                const value = toMonthValue(year, monthIndex)
                return (
                    <button
                        key={value}
                        onClick={() => onSelect(value)}
                        className={`h-11 rounded-xl text-sm font-medium transition-colors ${monthCellClass(value === selectedMonth, value === thisMonth)}`}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
