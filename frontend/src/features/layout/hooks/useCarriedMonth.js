import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// The last ?month= seen, remembered across a detour through Categories
// (which has no month param). Layout never unmounts between routes, so
// Dashboard → Categories → Transactions keeps the selected month.
//
// Adjusted during render (React's documented "adjust state when a prop
// changes" pattern) rather than in an effect, avoiding an extra commit.
export function useCarriedMonth() {
    const [searchParams] = useSearchParams()
    const monthParam = searchParams.get('month')
    const [lastMonth, setLastMonth] = useState(monthParam)
    const [previousParam, setPreviousParam] = useState(monthParam)

    if (monthParam !== previousParam) {
        setPreviousParam(monthParam)
        if (monthParam) setLastMonth(monthParam)
    }

    return monthParam ?? lastMonth
}
