import { PageTitle } from '@components/PageTitle'
import { MonthBar } from '@features/month/components/MonthBar'
import { DashboardSummary } from '@features/dashboard/components/DashboardSummary'
import { useSelectedMonth } from '@hooks/useSelectedMonth'

export function DashboardPage() {
    const [month, setMonth] = useSelectedMonth()

    return (
        <div>
            <PageTitle>Dashboard</PageTitle>
            <div className="mb-8">
                <MonthBar month={month} onChange={setMonth} />
            </div>
            <DashboardSummary month={month} />
        </div>
    )
}
