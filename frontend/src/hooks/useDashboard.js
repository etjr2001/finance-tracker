import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/dashboard'

// `month` should always be a concrete "YYYY-MM" string from the caller —
// never left undefined here. That way the query key changes whenever the
// month does, instead of caching under a fixed 'current' label that would
// keep returning last month's data after a midnight rollover.
export function useDashboard(month) {
    return useQuery({
        queryKey: ['dashboard', month],
        queryFn: () => getDashboard(month),
    })
}
