import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as transactionsApi from '../api/transactions'

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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => transactionsApi.updateTransaction(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: transactionsApi.deleteTransaction,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    })
}