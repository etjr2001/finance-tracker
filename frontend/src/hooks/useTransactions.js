import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as transactionsApi from '../api/transactions'
import * as demoApi from '../demo/demoApi'
import { useDemoMode } from '../demo/DemoModeContext'

// Transactions and the dashboard are both derived from the same data, so
// any write needs to invalidate both — otherwise the dashboard silently
// shows stale totals until an unrelated refetch happens to fire.
function invalidateAfterMutation(queryClient, isDemo) {
    queryClient.invalidateQueries({ queryKey: ['transactions', isDemo] })
    queryClient.invalidateQueries({ queryKey: ['dashboard', isDemo] })
}

export function useTransactions() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : transactionsApi
    return useQuery({
        queryKey: ['transactions', isDemo],
        queryFn: api.listTransactions,
    })
}

export function useCreateTransaction() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : transactionsApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.createTransaction,
        onSuccess: () => invalidateAfterMutation(queryClient, isDemo),
    })
}

export function useUpdateTransaction() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : transactionsApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => api.updateTransaction(id, payload),
        onSuccess: () => invalidateAfterMutation(queryClient, isDemo),
    })
}

export function useDeleteTransaction() {
    const isDemo = useDemoMode()
    const api = isDemo ? demoApi : transactionsApi
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: api.deleteTransaction,
        onSuccess: () => invalidateAfterMutation(queryClient, isDemo),
    })
}
