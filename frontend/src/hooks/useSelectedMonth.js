import { useSearchParams } from 'react-router-dom'
import { currentMonth, isValidMonth } from '@utils/date'

// The selected month, held in the URL as ?month=YYYY-MM (ADR0011), so
// refresh, the back button, and bookmarks all keep it. Falls back to the
// current month when the param is absent or not a valid YYYY-MM — this is
// the read side of that fallback; nothing ever writes an invalid value.
export function useSelectedMonth() {
    const [searchParams, setSearchParams] = useSearchParams()
    const param = searchParams.get('month')
    const month = isValidMonth(param) ? param : currentMonth()

    function setMonth(newMonth) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            next.set('month', newMonth)
            return next
        })
    }

    return [month, setMonth]
}
