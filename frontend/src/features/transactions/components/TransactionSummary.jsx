import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { DraftBadge } from '@features/transactions/components/DraftBadge'
import { categoryNameOf, isDraft } from '@features/transactions/utils/transaction'

// Tile, category name (+ Draft badge), note, and signed amount — the part
// of a row shared by the mobile (tappable) and desktop (actions) layouts.
// The note truncates below md: and wraps at md:+.
export function TransactionSummary({ transaction }) {
    return (
        <>
            <CategoryTile colorKey={transaction.category?.colorKey} iconKey={transaction.category?.iconKey} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate min-w-0">{categoryNameOf(transaction)}</span>
                    {isDraft(transaction) && <DraftBadge />}
                </div>
                {transaction.note && (
                    <div className="text-sm text-ink-soft truncate md:whitespace-normal md:overflow-visible md:break-words">
                        {transaction.note}
                    </div>
                )}
            </div>
            <SignedAmount transaction={transaction} className="shrink-0" />
        </>
    )
}
