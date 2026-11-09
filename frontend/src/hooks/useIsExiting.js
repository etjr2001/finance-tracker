import { createContext, useContext } from 'react'

// How long a closed popup stays on screen to animate out (ExitPresence).
// Matches the longest exit (Sheet's slide-down) and --animate-fade-out in
// index.css.
export const EXIT_MS = 200

// Provided by ExitPresence: true while its popup is animating out.
export const ExitingContext = createContext(false)

// True while the popup this is called from is animating out, so it can
// play its exit animation and ignore input meanwhile.
export function useIsExiting() {
    return useContext(ExitingContext)
}
