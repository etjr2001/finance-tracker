import { createContext, useContext } from 'react'

// Defaults to false so every consumer outside a DemoProvider (i.e. anywhere
// in the real app) behaves as non-demo with zero setup.
export const DemoModeContext = createContext(false)

export function useDemoMode() {
    return useContext(DemoModeContext)
}
