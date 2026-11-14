import { Star } from 'lucide-react'
import { DetailSheet } from '@components/DetailSheet'
import { IconButton } from '@components/IconButton'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { DraftBadge } from '@features/transactions/components/DraftBadge'
import { dayGroupLabel } from '@features/transactions/utils/dayGroups'
import { categoryNameOf, isDraft, isIncome } from '@features/transactions/utils/transaction'

// Read-only detail card for a Transaction, opened by tapping a row below
// md:. Layout comes from the shared DetailSheet; this adds the star, the
// date and the Draft badge.
//
// `isSavedAsFavourite`: the Transaction matches one of the User's
// Favourites (favouriteMatch.js), so the star is filled. What tapping it
// does in each state is up to the page.
export function TransactionDetail({ transaction, isSavedAsFavourite = false, onClose, onFavouriteClick, onEdit, onDelete }) {
    const { formatted: formattedDate } = dayGroupLabel(transaction.date)
    const typeLabel = isIncome(transaction) ? 'Income' : 'Expense'

    return (
        <DetailSheet
            tile={<CategoryTile colorKey={transaction.category?.colorKey} iconKey={transaction.category?.iconKey} size="lg" />}
            headerActions={
                <IconButton
                    icon={Star}
                    label={isSavedAsFavourite ? 'Saved as favourite' : 'Save as favourite'}
                    isIconFilled={isSavedAsFavourite}
                    tone={isSavedAsFavourite ? 'accent' : 'neutral'}
                    iconSize="h-5 w-5"
                    onClick={onFavouriteClick}
                />
            }
            title={categoryNameOf(transaction)}
            // Individual expenses in ink, income in deposit (ADR0010); the
            // sign says which.
            amount={
                <>
                    <SignedAmount transaction={transaction} className="font-serif font-semibold text-3xl tabular" />
                    {isDraft(transaction) && <DraftBadge />}
                </>
            }
            meta={`${formattedDate} · ${typeLabel}`}
            note={transaction.note}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    )
}
