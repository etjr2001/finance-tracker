import { useEffect, useEffectEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { shiftMonth } from '@utils/date'

// Loads the months either side of `month` into the cache in the background,
// so the month bar's arrows usually land on data that's already there.
// `getQueryOptions(month)` must return the same { queryKey, queryFn, … } the
// page's own useQuery uses, so a prefetched entry is the one it reads.
//
// Prefetched months follow the cache's normal lifetime: unused, they're
// dropped after gcTime (5 minutes by default), the same as any month left.
// A neighbour loaded in the last minute isn't fetched again just because
// the User moved next to it once more (PREFETCH_STALE_TIME); a write still
// invalidates it as usual.
const PREFETCH_STALE_TIME = 60_000

export function usePrefetchAdjacentMonths(month, getQueryOptions) {
    const queryClient = useQueryClient()

    // getQueryOptions is usually a fresh function each render; an effect
    // event always reads the latest one without making the effect rerun.
    const prefetch = useEffectEvent((adjacentMonth) => {
        queryClient.prefetchQuery({ ...getQueryOptions(adjacentMonth), staleTime: PREFETCH_STALE_TIME })
    })

    // Rerun only when the neighbours' keys change: a new month, or demo
    // mode switching (it's part of each key).
    const keysHash = JSON.stringify([
        getQueryOptions(shiftMonth(month, -1)).queryKey,
        getQueryOptions(shiftMonth(month, 1)).queryKey,
    ])

    useEffect(() => {
        prefetch(shiftMonth(month, -1))
        prefetch(shiftMonth(month, 1))
    }, [month, keysHash])
}
