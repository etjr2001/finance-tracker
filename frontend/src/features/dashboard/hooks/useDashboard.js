import { useQuery, keepPreviousData } from '@tanstack/react-query'
import * as dashboardApi from '@features/dashboard/api/dashboardApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { usePrefetchAdjacentMonths } from '@hooks/usePrefetchAdjacentMonths'
import { queryKeys } from '@api/queryKeys'

// One month's query, shared by useQuery and the prefetch so their keys and
// fetchers can't drift apart.
function dashboardQuery({ isDemo, api, networkOptions }, month) {
    return {
        queryKey: queryKeys.dashboardForMonth(isDemo, month),
        queryFn: () => api.getDashboard(month),
        ...networkOptions,
    }
}

// `month` must be a concrete "YYYY-MM" from the caller, never undefined, so
// the query key changes with the month instead of caching under a fixed
// label that would keep serving last month's data after a midnight rollover.
// Like useTransactions, the previous month stays on screen while the next
// one loads (isPlaceholderData is true meanwhile), instead of flashing a
// loading state; and the months either side are prefetched.
export function useDashboard(month) {
    const source = useDemoAwareApi(dashboardApi)
    usePrefetchAdjacentMonths(month, (adjacentMonth) => dashboardQuery(source, adjacentMonth))
    return useQuery({
        ...dashboardQuery(source, month),
        placeholderData: keepPreviousData,
    })
}
