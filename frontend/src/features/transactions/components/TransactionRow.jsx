import { Pencil, Star, Trash2 } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { TransactionSummary } from '@features/transactions/components/TransactionSummary'

const ROW_CLASS = 'flex items-center gap-3 px-4 py-3'

// Below md: the whole row is a button opening a read-only detail card
// (no inline actions — docs/backlog.md mobile-row spec). At md:+ the row
// is static with an inline star, Edit and Delete. The star is filled when
// the Transaction matches a Favourite (favouriteMatch.js); the page decides
// what tapping it does in each state.
export function TransactionRow({
    transaction,
    isMobile,
    isDeleting,
    isSavedAsFavourite,
    onOpenDetail,
    onFavouriteClick,
    onEdit,
    onDelete,
}) {
    if (isMobile) {
        return (
            <button onClick={() => onOpenDetail(transaction)} className={`w-full text-left ${ROW_CLASS}`}>
                <TransactionSummary transaction={transaction} />
            </button>
        )
    }

    return (
        <div className={ROW_CLASS}>
            <TransactionSummary transaction={transaction} />
            <div className="flex items-center gap-1">
                <IconButton
                    icon={Star}
                    label={isSavedAsFavourite ? 'Saved as favourite' : 'Save as favourite'}
                    hasTooltip
                    isIconFilled={isSavedAsFavourite}
                    tone={isSavedAsFavourite ? 'accent' : 'neutral'}
                    onClick={() => onFavouriteClick(transaction)}
                />
                <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(transaction)} />
                <IconButton
                    icon={Trash2}
                    label="Delete"
                    tone="danger"
                    isDisabled={isDeleting}
                    onClick={() => onDelete(transaction)}
                />
            </div>
        </div>
    )
}
