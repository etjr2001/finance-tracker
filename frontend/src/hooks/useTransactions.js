import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as transactionsApi from '../api/transactions'

// Transactions and the dashboard are both derived from the same data, so
// any write needs to invalidate both — otherwise the dashboard silently
// shows stale totals until an unrelated refetch happens to fire.
function invalidateAfterMutation(queryClient) {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: transactionsApi.listTransactions,
    })
}

export function useCreateTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: transactionsApi.createTransaction,
        onSuccess: () => invalidateAfterMutation(queryClient),
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => transactionsApi.updateTransaction(id, payload),
        onSuccess: () => invalidateAfterMutation(queryClient),
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: transactionsApi.deleteTransaction,
        onSuccess: () => invalidateAfterMutation(queryClient),
    })
}
