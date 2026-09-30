import { useMemo } from 'react'
import { useTransactions } from '@features/transactions/hooks/useTransactions'
import { groupByDay } from '@features/transactions/utils/dayGroups'

// The viewed month's Transactions, grouped into day sections.
export function useMonthTransactions(month) {
    const { data: transactions, isLoading, isError } = useTransactions(month)

    // The server returns the month newest first, which groupByDay relies on.
    const dayGroups = useMemo(() => groupByDay(transactions ?? []), [transactions])

    return { dayGroups, isLoading, hasError: isError }
}
