import { useEffect, useState } from 'react'
import { EXIT_MS, ExitingContext } from '@hooks/useIsExiting'

// Keeps a conditionally rendered popup on screen for EXIT_MS after its
// condition turns false, so Modal/Sheet can animate out instead of
// vanishing:
//
//   <ExitPresence>{isOpen && <ConfirmDialog … />}</ExitPresence>
//
// While exiting it renders the last children it was given (their data,
// e.g. a delete target, may already be gone) with useIsExiting() true.
// Same under reduced motion: popups then fade out instead of moving, but
// still need the time. Reopening mid-exit shows the new children straight
// away.
export function ExitPresence({ children }) {
    // "Store previous props in state": lets a render see what was shown
    // last time without reading a ref during render.
    const [previousChildren, setPreviousChildren] = useState(children)
    const [exitingChildren, setExitingChildren] = useState(null)

    if (children !== previousChildren) {
        setPreviousChildren(children)
        if (children) setExitingChildren(null)
        else if (previousChildren) setExitingChildren(previousChildren)
    }

    useEffect(() => {
        if (!exitingChildren) return
        const timer = setTimeout(() => setExitingChildren(null), EXIT_MS)
        return () => clearTimeout(timer)
    }, [exitingChildren])

    const isExiting = !children && exitingChildren !== null

    // Same tree shape whether open or exiting, so React keeps the popup's
    // component instance (and state, e.g. a Sheet's drag offset) during
    // the exit.
    return <ExitingContext.Provider value={isExiting}>{children || exitingChildren || null}</ExitingContext.Provider>
}
