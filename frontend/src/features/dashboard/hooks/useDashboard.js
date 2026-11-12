import { useQuery, keepPreviousData } from '@tanstack/react-query'
import * as dashboardApi from '@features/dashboard/api/dashboardApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { queryKeys } from '@api/queryKeys'

// `month` must be a concrete "YYYY-MM" from the caller, never undefined, so
// the query key changes with the month instead of caching under a fixed
// label that would keep serving last month's data after a midnight rollover.
// Like useTransactions, the previous month stays on screen while the next
// one loads (isPlaceholderData is true meanwhile), instead of flashing a
// loading state.
export function useDashboard(month) {
    const { isDemo, api, networkOptions } = useDemoAwareApi(dashboardApi)
    return useQuery({
        queryKey: queryKeys.dashboardForMonth(isDemo, month),
        queryFn: () => api.getDashboard(month),
        placeholderData: keepPreviousData,
        ...networkOptions,
    })
}
