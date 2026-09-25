import { DemoModeContext } from '@features/demo/context/DemoModeContext'
import { ensureSeeded } from '@features/demo/api/demoApi'

// Wraps the /demo route subtree. Seeds localStorage before the first render
// commits (ensureSeeded() is an idempotent no-op once seeded), then
// provides `true` down the tree.
export function DemoProvider({ children }) {
    ensureSeeded()
    return <DemoModeContext.Provider value={true}>{children}</DemoModeContext.Provider>
}
