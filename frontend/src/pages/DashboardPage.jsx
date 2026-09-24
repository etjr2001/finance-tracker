import { useMemo, useState } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import Money from '../components/Money'
import { formatMoney } from '../lib/money'
import { currentMonth } from '../lib/date'

export default function DashboardPage() {
    const [month, setMonth] = useState(currentMonth())
    const { data, isLoading, isError } = useDashboard(month)

    const maxCategoryTotal = useMemo(() => {
        if (!data?.byCategory?.length) return 0
        return Math.max(...data.byCategory.map((c) => c.total))
    }, [data])

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif font-semibold text-2xl">Dashboard</h2>
                <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker?.()}
                    className="border border-rule-strong bg-white px-3 py-1.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                />
            </div>

            {isLoading && <p className="text-ink-soft text-sm">Loading dashboard…</p>}
            {isError && <p className="text-withdrawal text-sm">Could not load the dashboard.</p>}

            {data && (
                <>
                    <div className="grid grid-cols-3 gap-6 mb-10 max-w-lg border-t border-b border-rule py-6">
                        <Stat label="Income" value={data.totalIncome} tone="text-deposit" />
                        <Stat label="Expenses" value={data.totalExpenses} tone="text-withdrawal" />
                        <Stat
                            label="Net"
                            value={data.net}
                            tone={data.net >= 0 ? 'text-brass-ink' : 'text-withdrawal'}
                        />
                    </div>

                    <h3 className="font-serif font-semibold text-lg mb-4">By category</h3>
                    {data.byCategory.length === 0 && (
                        <p className="text-ink-soft text-sm">No transactions in this period yet.</p>
                    )}
                    <ul className="space-y-3 max-w-xl">
                        {data.byCategory.map((c) => (
                            <li key={c.categoryId}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{c.categoryName}</span>
                                    <span className="tabular text-ink-soft">{formatMoney(c.total)}</span>
                                </div>
                                <div className="h-1.5 bg-track rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-ink"
                                        style={{
                                            width: maxCategoryTotal
                                                ? `${(c.total / maxCategoryTotal) * 100}%`
                                                : '0%',
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}

function Stat({ label, value, tone }) {
    return (
        <div>
            <div className="text-sm text-ink-soft mb-1">{label}</div>
            <div className={`font-serif font-semibold text-xl tabular ${tone}`}>
                <Money amount={value} />
            </div>
        </div>
    )
}