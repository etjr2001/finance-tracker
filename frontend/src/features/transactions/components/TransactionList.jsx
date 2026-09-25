import { Card } from '@components/Card'
import { StatusMessage } from '@components/StatusMessage'
import { DayGroupHeader } from '@features/transactions/components/DayGroupHeader'
import { TransactionRow } from '@features/transactions/components/TransactionRow'
import { formatMonth } from '@utils/date'

export function TransactionList({
    dayGroups,
    month,
    isLoading,
    hasError,
    isMobile,
    isDeleting,
    onOpenDetail,
    onEdit,
    onDelete,
}) {
    if (isLoading) return <StatusMessage>Loading transactions…</StatusMessage>
    if (hasError) return <StatusMessage tone="error">Could not load transactions.</StatusMessage>

    // No Add button here: the page header always shows one (ADR0011's
    // "an Add action, not a blank list"), so a second would be a duplicate.
    if (dayGroups.length === 0) {
        return <StatusMessage className="text-center py-12">No transactions in {formatMonth(month)}.</StatusMessage>
    }

    return (
        <div className="space-y-6">
            {dayGroups.map((group) => (
                <div key={group.date}>
                    <DayGroupHeader label={group.label} total={group.total} />
                    <Card className="divide-y divide-rule-soft">
                        {group.transactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                isMobile={isMobile}
                                isDeleting={isDeleting(transaction.id)}
                                onOpenDetail={onOpenDetail}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </Card>
                </div>
            ))}
        </div>
    )
}
