import { StatusMessage } from '@components/StatusMessage'
import { useDashboard } from '@features/dashboard/hooks/useDashboard'
import { NetCard } from '@features/dashboard/components/NetCard'
import { CategoryBreakdown } from '@features/dashboard/components/CategoryBreakdown'

export function DashboardSummary({ month }) {
    const { data, isLoading, isError } = useDashboard(month)

    if (isLoading) return <StatusMessage>Loading dashboard…</StatusMessage>
    if (isError) return <StatusMessage tone="error">Could not load the dashboard.</StatusMessage>
    if (!data) return null

    return (
        <>
            <NetCard income={data.totalIncome} expenses={data.totalExpenses} net={data.net} />
            <CategoryBreakdown byCategory={data.byCategory} />
        </>
    )
}
