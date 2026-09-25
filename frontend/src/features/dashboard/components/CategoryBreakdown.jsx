import { useMemo } from 'react'
import { StatusMessage } from '@components/StatusMessage'
import { ProgressBar } from '@components/ProgressBar'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { categoryBarClass } from '@features/categories/utils/categorySwatch'
import { toBreakdownRows } from '@features/dashboard/utils/dashboardMath'
import { formatMoney } from '@utils/money'

function CategoryBreakdownRow({ row }) {
    return (
        <li>
            <div className="flex items-center gap-3 mb-1.5">
                <CategoryTile categoryId={row.categoryId} categoryName={row.categoryName} />
                <span className="flex-1 min-w-0 truncate">{row.categoryName}</span>
                <span className="text-sm text-ink-soft tabular shrink-0">{row.sharePercent}%</span>
                <span className="tabular shrink-0">{formatMoney(row.total)}</span>
            </div>
            <ProgressBar percent={row.barWidth} fillClass={categoryBarClass(row.categoryId)} />
        </li>
    )
}

export function CategoryBreakdown({ byCategory }) {
    const rows = useMemo(() => toBreakdownRows(byCategory), [byCategory])

    return (
        <>
            <h3 className="font-serif font-semibold text-lg mb-4">Spending by category</h3>
            {rows.length === 0 ? (
                <StatusMessage>No transactions in this period yet.</StatusMessage>
            ) : (
                <ul className="space-y-4 max-w-xl">
                    {rows.map((row) => (
                        <CategoryBreakdownRow key={row.categoryId} row={row} />
                    ))}
                </ul>
            )}
        </>
    )
}
