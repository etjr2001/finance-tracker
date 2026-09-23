import { DemoModeContext } from './DemoModeContext'
import { ensureSeeded } from './demoApi'

// Wraps the /demo route subtree. Seeds localStorage before the first render
// commits (ensureSeeded() is an idempotent no-op once already seeded, so
// re-running it on every render is harmless), then provides `true` down the
// tree.
export default function DemoProvider({ children }) {
    ensureSeeded()
    return <DemoModeContext.Provider value={true}>{children}</DemoModeContext.Provider>
}
