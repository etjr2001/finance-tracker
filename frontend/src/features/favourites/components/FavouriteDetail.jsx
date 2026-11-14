import { DetailSheet } from '@components/DetailSheet'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { categoryNameOf, isIncome } from '@features/transactions/utils/transaction'
import { favouriteName, hasNoAmount } from '@features/favourites/utils/favouriteForm'

// Read-only detail card for a Favourite, opened by tapping a row below md:
// (same DetailSheet layout as a Transaction's). No star, since it already
// is a Favourite, and no "Use": Favourites are only used from the Add
// transaction form (ADR0017).
//
// The title is the Favourite's name (its note, else its Category), so the
// meta line adds the Category only when the note took the title.
export function FavouriteDetail({ favourite, onClose, onEdit, onDelete }) {
    const typeLabel = isIncome(favourite) ? 'Income' : 'Expense'
    const meta = favourite.note ? `${categoryNameOf(favourite)} · ${typeLabel}` : typeLabel

    return (
        <DetailSheet
            tile={<CategoryTile colorKey={favourite.category?.colorKey} iconKey={favourite.category?.iconKey} size="lg" />}
            title={favouriteName(favourite)}
            // Zero means "fill in when used", not $0 (ADR0017), as in the list.
            amount={
                hasNoAmount(favourite) ? (
                    <span className="font-serif font-semibold text-3xl text-ink-soft">No amount</span>
                ) : (
                    <SignedAmount transaction={favourite} className="font-serif font-semibold text-3xl tabular" />
                )
            }
            meta={meta}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    )
}
