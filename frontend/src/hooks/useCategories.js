import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as categoriesApi from '../api/categories'
import * as demoApi from '../demo/demoApi'
import { useDemoMode } from '../demo/DemoModeContext'
import { demoNetworkMode } from '../demo/demoNetworkMode'

export function useCategories() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : categoriesApi
    return useQuery({
        queryKey: ['categories', isDemo],
        queryFn: api.listCategories,
        ...demoNetworkMode(isDemo),
    })
}

export function useCreateCategory() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : categoriesApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.createCategory,
        ...demoNetworkMode(isDemo),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', isDemo] }),
    })
}

export function useUpdateCategory() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : categoriesApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => api.updateCategory(id, payload),
        ...demoNetworkMode(isDemo),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', isDemo] }),
    })
}

export function useDeleteCategory() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : categoriesApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.deleteCategory,
        ...demoNetworkMode(isDemo),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', isDemo] }),
    })
}
