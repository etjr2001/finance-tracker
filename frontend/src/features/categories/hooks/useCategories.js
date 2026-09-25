import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as categoriesApi from '@features/categories/api/categoriesApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { queryKeys } from '@api/queryKeys'

export function useCategories() {
    const { isDemo, api, networkOptions } = useDemoAwareApi(categoriesApi)
    return useQuery({
        queryKey: queryKeys.categories(isDemo),
        queryFn: api.listCategories,
        ...networkOptions,
    })
}

// Shared shape of every category write: pick the API function, then
// refresh the category list once it succeeds.
function useCategoryMutation(selectMutationFn) {
    const { isDemo, api, networkOptions } = useDemoAwareApi(categoriesApi)
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: selectMutationFn(api),
        ...networkOptions,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(isDemo) }),
    })
}

export function useCreateCategory() {
    return useCategoryMutation((api) => api.createCategory)
}

export function useUpdateCategory() {
    return useCategoryMutation((api) => ({ id, ...payload }) => api.updateCategory(id, payload))
}

export function useDeleteCategory() {
    return useCategoryMutation((api) => api.deleteCategory)
}
