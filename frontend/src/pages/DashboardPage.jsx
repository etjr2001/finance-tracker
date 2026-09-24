import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import Money from '../components/Money'
import Card from '../components/Card'
import MonthBar from '../components/MonthBar'
import { categoryTileClasses, categoryBarClass } from '../lib/categorySwatch'
import { categoryIcon } from '../lib/categoryIcon'
import { formatMoney } from '../lib/money'
import { useSelectedMonth } from '../hooks/useSelectedMonth'

export default function DashboardPage() {
    const [month, setMonth] = useSelectedMonth()
    const { data, isLoading, isError } = useDashboard(month)

    const maxCategoryTotal = useMemo(() => {
        if (!data?.byCategory?.length) return 0
        return Math.max(...data.byCategory.map((c) => c.total))
    }, [data])

    // Denominator for each row's percentage-of-total figure.
    const categoryTotalSum = useMemo(() => {
        if (!data?.byCategory?.length) return 0
        return data.byCategory.reduce((sum, c) => sum + c.total, 0)
    }, [data])

    return (
        <div>
            <h2 className="font-serif font-semibold text-2xl mb-4">Dashboard</h2>
            <div className="mb-8">
                <MonthBar month={month} onChange={setMonth} />
            </div>

            {isLoading && <p className="text-ink-soft text-sm">Loading dashboard…</p>}
            {isError && <p className="text-withdrawal text-sm">Could not load the dashboard.</p>}

            {data && (
                <>
                    <NetCard income={data.totalIncome} expenses={data.totalExpenses} net={data.net} />

                    <h3 className="font-serif font-semibold text-lg mb-4">Spending by category</h3>
                    {data.byCategory.length === 0 && (
                        <p className="text-ink-soft text-sm">No transactions in this period yet.</p>
                    )}
                    <ul className="space-y-4 max-w-xl">
                        {data.byCategory.map((c) => {
                            const Icon = categoryIcon(c.categoryName)
                            const percent = categoryTotalSum ? Math.round((c.total / categoryTotalSum) * 100) : 0
                            return (
                                <li key={c.categoryId}>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <div
                                            className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${categoryTileClasses(c.categoryId)}`}
                                        >
                                            <Icon aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 min-w-0 truncate">{c.categoryName}</span>
                                        <span className="text-sm text-ink-soft tabular shrink-0">{percent}%</span>
                                        <span className="tabular shrink-0">{formatMoney(c.total)}</span>
                                    </div>
                                    <div className="h-1.5 bg-track rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${categoryBarClass(c.categoryId)}`}
                                            style={{
                                                width: maxCategoryTotal
                                                    ? `${(c.total / maxCategoryTotal) * 100}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </div>
    )
}

// Hero card: "Net this month" as the headline figure (colour follows sign),
// a two-colour Income/Expense bar, then both as sub-stats — per the layout
// reference in docs/backlog.md's style/dashboard-page entry, not the
// three-equal-tile grid this replaces.
function NetCard({ income, expenses, net }) {
    const netColor = net >= 0 ? 'text-deposit' : 'text-withdrawal'
    // How much of this month's income has gone to expenses. Undefined
    // (shown as "—") with no income to divide by, rather than a
    // misleading 0% or Infinity.
    const spentOfIncome = income > 0 ? Math.round((expenses / income) * 100) : null
    // Whichever of Income/Expenses is larger is the 100% baseline, the
    // other scaled against it — not Income fixed at 100% with Expenses
    // capped there too, which would visually hide that expenses can
    // actually be several times income (a month in the red looking the
    // same "full bar" as a month in the black).
    const largerOfBoth = Math.max(income, expenses)
    const incomeBarWidth = largerOfBoth ? (income / largerOfBoth) * 100 : 0
    const expenseBarWidth = largerOfBoth ? (expenses / largerOfBoth) * 100 : 0

    return (
        <Card className="p-6 mb-10 max-w-xl">
            <div className="text-sm text-ink-soft mb-1">Net this month</div>
            <div className={`font-serif font-semibold text-4xl tabular mb-6 ${netColor}`}>
                <Money amount={net} />
            </div>

            <div className="mb-5">
                <div className="flex items-center gap-1 text-sm text-ink-soft mb-1">
                    <ArrowDownLeft aria-hidden="true" strokeWidth={1.7} className="h-3.5 w-3.5 text-deposit" />
                    Income
                </div>
                <div className="font-medium tabular mb-1.5">
                    <Money amount={income} />
                </div>
                <div className="h-1.5 bg-track rounded-full overflow-hidden">
                    <div className="h-full bg-deposit" style={{ width: `${incomeBarWidth}%` }} />
                </div>
            </div>

            <div>
                <div className="flex items-center gap-1 text-sm text-ink-soft mb-1">
                    <ArrowUpRight aria-hidden="true" strokeWidth={1.7} className="h-3.5 w-3.5 text-withdrawal" />
                    Expenses
                </div>
                <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-medium tabular">
                        <Money amount={expenses} />
                    </span>
                    <span className="text-sm text-ink-soft tabular">
                        {spentOfIncome === null ? '—' : `${spentOfIncome}% of income`}
                    </span>
                </div>
                <div className="h-1.5 bg-track rounded-full overflow-hidden">
                    <div className="h-full bg-withdrawal" style={{ width: `${expenseBarWidth}%` }} />
                </div>
            </div>
        </Card>
    )
}
