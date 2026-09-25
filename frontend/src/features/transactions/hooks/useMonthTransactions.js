import { useMemo } from 'react'
import { useTransactions } from '@features/transactions/hooks/useTransactions'
import { transactionsInMonth } from '@features/transactions/utils/transaction'
import { groupByDay } from '@features/transactions/utils/dayGroups'

// The viewed month's Transactions, grouped into day sections.
export function useMonthTransactions(month) {
    const { data: transactions, isLoading, isError } = useTransactions()

    const dayGroups = useMemo(
        () => groupByDay(transactionsInMonth(transactions ?? [], month)),
        [transactions, month]
    )

    return { dayGroups, isLoading, hasError: isError }
}
