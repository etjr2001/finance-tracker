import { X } from 'lucide-react'
import { Modal } from '@components/Modal'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { DraftBadge } from '@features/transactions/components/DraftBadge'
import { dayGroupLabel } from '@features/transactions/utils/dayGroups'
import { categoryNameOf, isDraft } from '@features/transactions/utils/transaction'

// Read-only detail card opened by tapping a row below md:. Edit/Delete
// hand off to the page's existing flows — no mutation logic lives here.
export function TransactionDetail({ transaction, onClose, onEdit, onDelete }) {
    const { formatted: formattedDate } = dayGroupLabel(transaction.date)

    return (
        <Modal onRequestClose={onClose}>
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                    <CategoryTile
                        colorKey={transaction.category?.colorKey}
                        iconKey={transaction.category?.iconKey}
                        size="lg"
                    />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">{categoryNameOf(transaction)}</span>
                            {isDraft(transaction) && <DraftBadge />}
                        </div>
                        <div className="text-sm text-ink-soft">{formattedDate}</div>
                    </div>
                </div>
                <IconButton icon={X} label="Close" onClick={onClose} iconSize="h-5 w-5" className="-mt-2 -mr-2" />
            </div>

            {/* A single hero number, so colour follows sign like the
                Dashboard Net (unlike list rows, which keep expenses ink). */}
            <SignedAmount
                transaction={transaction}
                expenseClass="text-withdrawal"
                className="block font-serif font-semibold text-3xl tabular mb-5"
            />

            {transaction.note && <p className="text-sm text-ink-soft mb-5">{transaction.note}</p>}

            <div className="flex gap-3">
                <Button onClick={onEdit}>Edit</Button>
                <Button variant="dangerGhost" onClick={onDelete}>
                    Delete
                </Button>
            </div>
        </Modal>
    )
}
