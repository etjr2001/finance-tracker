import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as favouritesApi from '@features/favourites/api/favouritesApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { queryKeys } from '@api/queryKeys'

export function useFavourites() {
    const { isDemo, api, networkOptions } = useDemoAwareApi(favouritesApi)
    return useQuery({
        queryKey: queryKeys.favourites(isDemo),
        queryFn: api.listFavourites,
        ...networkOptions,
    })
}

// A Favourite isn't a Transaction (ADR0017), so writes only refresh this list.
function useFavouriteMutation(selectMutationFn) {
    const { isDemo, api, networkOptions } = useDemoAwareApi(favouritesApi)
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: selectMutationFn(api),
        ...networkOptions,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favourites(isDemo) }),
    })
}

export function useCreateFavourite() {
    return useFavouriteMutation((api) => api.createFavourite)
}

export function useUpdateFavourite() {
    return useFavouriteMutation((api) => ({ id, ...payload }) => api.updateFavourite(id, payload))
}

export function useDeleteFavourite() {
    return useFavouriteMutation((api) => api.deleteFavourite)
}
