import { useDemoMode } from '@features/demo/context/DemoModeContext'
import { demoNetworkMode } from '@features/demo/utils/demoNetworkMode'
import * as demoApi from '@features/demo/api/demoApi'

// Every data hook needs the same three things: whether we're in demo mode,
// which API module to call (demoApi mirrors the real modules' function
// names — ADR0009), and the React Query options demo mode requires.
// Centralizing this removes the branch that was copy-pasted into each hook.
export function useDemoAwareApi(realApi) {
    const isDemo = useDemoMode()
    return {
        isDemo,
        api: isDemo ? demoApi : realApi,
        networkOptions: demoNetworkMode(isDemo),
    }
}
