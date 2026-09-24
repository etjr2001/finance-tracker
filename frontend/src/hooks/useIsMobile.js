import { useState, useEffect } from 'react'

// Matches Tailwind's `md:` breakpoint (min-width: 768px) — the same
// boundary TransactionForm.jsx's grid-cols-1 md:grid-cols-2 already uses.
// Reactive (not just checked once on mount), so a tab that gets resized or
// rotated updates immediately rather than on the next render.
const DESKTOP_QUERY = '(min-width: 768px)'

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => !window.matchMedia(DESKTOP_QUERY).matches)

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY)
        const handleChange = () => setIsMobile(!mql.matches)
        mql.addEventListener('change', handleChange)
        return () => mql.removeEventListener('change', handleChange)
    }, [])

    return isMobile
}
