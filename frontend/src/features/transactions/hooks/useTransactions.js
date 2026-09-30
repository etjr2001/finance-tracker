import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import * as transactionsApi from '@features/transactions/api/transactionsApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { queryKeys } from '@api/queryKeys'

// `month` must be a concrete "YYYY-MM" from the caller (see useDashboard).
// The previous month stays on screen while the next one loads, so switching
// months doesn't flash a loading state.
export function useTransactions(month) {
    const { isDemo, api, networkOptions } = useDemoAwareApi(transactionsApi)
    return useQuery({
        queryKey: queryKeys.transactionsForMonth(isDemo, month),
        queryFn: () => api.listTransactions(month),
        placeholderData: keepPreviousData,
        ...networkOptions,
    })
}

// Every Draft across all months, oldest first, for the "N Drafts to finish"
// notice and sheet.
export function useDrafts() {
    const { isDemo, api, networkOptions } = useDemoAwareApi(transactionsApi)
    return useQuery({
        queryKey: queryKeys.drafts(isDemo),
        queryFn: api.listDrafts,
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
