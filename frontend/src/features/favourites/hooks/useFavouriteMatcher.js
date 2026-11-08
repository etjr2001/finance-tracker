import { useMemo } from 'react'
import { useFavourites } from '@features/favourites/hooks/useFavourites'
import { buildFavouriteMatcher } from '@features/favourites/utils/favouriteMatch'

// (transaction) => the Favourite it matches, or null. Uses the same cached
// Favourites query as the picker. Until Favourites load it matches nothing,
// so stars show as outlines for that moment.
export function useFavouriteMatcher() {
    const { data: favourites } = useFavourites()
    return useMemo(() => buildFavouriteMatcher(favourites ?? []), [favourites])
}
