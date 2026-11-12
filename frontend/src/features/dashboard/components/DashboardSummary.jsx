import { StatusMessage } from '@components/StatusMessage'
import { StaleContent } from '@components/StaleContent'
import { useDashboard } from '@features/dashboard/hooks/useDashboard'
import { NetCard } from '@features/dashboard/components/NetCard'
import { CategoryBreakdown } from '@features/dashboard/components/CategoryBreakdown'

// "Loading…" shows only on the very first load; after that a month change
// keeps the previous month's figures up, dimmed, until the new ones arrive.
export function DashboardSummary({ month }) {
    const { data, isLoading, isError, isPlaceholderData } = useDashboard(month)

    if (isLoading) return <StatusMessage>Loading dashboard…</StatusMessage>
    if (isError) return <StatusMessage tone="error">Could not load the dashboard.</StatusMessage>
    if (!data) return null

    return (
        <StaleContent isStale={isPlaceholderData}>
            <NetCard income={data.totalIncome} expenses={data.totalExpenses} net={data.net} />
            <CategoryBreakdown byCategory={data.byCategory} />
        </StaleContent>
    )
}
