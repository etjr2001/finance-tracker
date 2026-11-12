import { useMemo } from 'react'
import { useTransactions } from '@features/transactions/hooks/useTransactions'
import { groupByDay } from '@features/transactions/utils/dayGroups'

// The viewed month's Transactions, grouped into day sections. `isStale` is
// true while the previous month's list is shown as a placeholder for this one.
export function useMonthTransactions(month) {
    const { data: transactions, isLoading, isError, isPlaceholderData } = useTransactions(month)

    // The server returns the month newest first, which groupByDay relies on.
    const dayGroups = useMemo(() => groupByDay(transactions ?? []), [transactions])

    return { dayGroups, isLoading, isStale: isPlaceholderData, hasError: isError }
}
