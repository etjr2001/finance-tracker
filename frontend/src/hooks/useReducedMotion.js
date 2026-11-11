import { useState, useEffect } from 'react'

// True when the device asks for reduced motion (e.g. iOS Reduce Motion).
// The app's rule: under reduced motion, drop movement (slides, pops, zooms)
// but keep opacity fades. CSS handles most of it with motion-safe: /
// motion-reduce:; this is for motion set from JS, like Sheet's slide.
// Reactive, like useIsMobile.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion() {
    const [isReduced, setIsReduced] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches)

    useEffect(() => {
        const mql = window.matchMedia(REDUCED_MOTION_QUERY)
        const handleChange = () => setIsReduced(mql.matches)
        mql.addEventListener('change', handleChange)
        return () => mql.removeEventListener('change', handleChange)
    }, [])

    return isReduced
}
