import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import * as transactionsApi from '@features/transactions/api/transactionsApi'
import { useDemoAwareApi } from '@features/demo/hooks/useDemoAwareApi'
import { usePrefetchAdjacentMonths } from '@hooks/usePrefetchAdjacentMonths'
import { queryKeys } from '@api/queryKeys'

// One month's query, shared by useQuery and the prefetch so their keys and
// fetchers can't drift apart.
function monthTransactionsQuery({ isDemo, api, networkOptions }, month) {
    return {
        queryKey: queryKeys.transactionsForMonth(isDemo, month),
        queryFn: () => api.listTransactions(month),
        ...networkOptions,
    }
}

// `month` must be a concrete "YYYY-MM" from the caller (see useDashboard).
// The previous month stays on screen while the next one loads, so switching
// months doesn't flash a loading state; and the months either side are
// prefetched, so the arrows usually land on data that's already there.
export function useTransactions(month) {
    const source = useDemoAwareApi(transactionsApi)
    usePrefetchAdjacentMonths(month, (adjacentMonth) => monthTransactionsQuery(source, adjacentMonth))
    return useQuery({
        ...monthTransactionsQuery(source, month),
        placeholderData: keepPreviousData,
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
