import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/dashboard'
import { getDashboard as getDemoDashboard } from '../demo/demoApi'
import { useDemoMode } from '../demo/DemoModeContext'
import { demoNetworkMode } from '../demo/demoNetworkMode'

// `month` should always be a concrete "YYYY-MM" string from the caller —
// never left undefined here. That way the query key changes whenever the
// month does, instead of caching under a fixed 'current' label that would
// keep returning last month's data after a midnight rollover.
export function useDashboard(month) {
    const isDemo = useDemoMode()
    return useQuery({
        queryKey: ['dashboard', isDemo, month],
        queryFn: () => (isDemo ? getDemoDashboard(month) : getDashboard(month)),
        ...demoNetworkMode(isDemo),
    })
}
