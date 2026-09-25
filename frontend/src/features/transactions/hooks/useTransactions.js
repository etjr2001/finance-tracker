import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as transactionsApi from '@features/transactions/api/transactionsApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { queryKeys } from '@api/queryKeys'

export function useTransactions() {
    const { isDemo, api, networkOptions } = useDemoAwareApi(transactionsApi)
    return useQuery({
        queryKey: queryKeys.transactions(isDemo),
        queryFn: api.listTransactions,
        ...networkOptions,
    })
}

// Transactions and the Dashboard derive from the same data, so every write
// invalidates both — otherwise the Dashboard shows stale totals.
function useTransactionMutation(selectMutationFn) {
    const { isDemo, api, networkOptions } = useDemoAwareApi(transactionsApi)
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: selectMutationFn(api),
        ...networkOptions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions(isDemo) })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(isDemo) })
        },
    })
}

export function useCreateTransaction() {
    return useTransactionMutation((api) => api.createTransaction)
}

export function useUpdateTransaction() {
    return useTransactionMutation((api) => ({ id, ...payload }) => api.updateTransaction(id, payload))
}

export function useDeleteTransaction() {
    return useTransactionMutation((api) => api.deleteTransaction)
}
