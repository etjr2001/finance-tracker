import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Card } from '@components/Card'
import { Money } from '@components/Money'
import { NetStat } from '@features/dashboard/components/NetStat'
import { incomeExpenseBarWidths, spentOfIncomePercent } from '@features/dashboard/utils/dashboardMath'

// Hero card (ADR0013): Net as the headline figure, colour following its
// sign, with Income and Expenses as sub-stats underneath.
export function NetCard({ income, expenses, net }) {
    const netColor = net >= 0 ? 'text-deposit' : 'text-withdrawal'
    const spentPercent = spentOfIncomePercent(income, expenses)
    const { incomeWidth, expenseWidth } = incomeExpenseBarWidths(income, expenses)

    return (
        <Card className="p-6 mb-10 max-w-xl space-y-5">
            <div>
                <div className="text-sm text-ink-soft mb-1">Net this month</div>
                <div className={`font-serif font-semibold text-4xl tabular pb-1 ${netColor}`}>
                    <Money amount={net} />
                </div>
            </div>

            <NetStat
                icon={ArrowDownLeft}
                iconClass="text-deposit"
                label="Income"
                amount={income}
                barPercent={incomeWidth}
                barClass="bg-deposit"
            />
            <NetStat
                icon={ArrowUpRight}
                iconClass="text-withdrawal"
                label="Expenses"
                amount={expenses}
                barPercent={expenseWidth}
                barClass="bg-withdrawal"
                aside={spentPercent === null ? '—' : `${spentPercent}% of income`}
            />
        </Card>
    )
}
