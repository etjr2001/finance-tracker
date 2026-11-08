import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { categoryNameOf } from '@features/transactions/utils/transaction'
import { favouriteName, hasNoAmount } from '@features/favourites/utils/favouriteForm'

// Tile, name and amount for one Favourite, shared by the Favourites list and
// the Favourites picker in the Transaction form so both show it the same way. The note names
// the Favourite when there is one, with its Category underneath; otherwise
// the Category alone.
export function FavouriteSummary({ favourite }) {
    return (
        <>
            <CategoryTile colorKey={favourite.category?.colorKey} iconKey={favourite.category?.iconKey} />
            <div className="min-w-0 flex-1">
                <div className="truncate">{favouriteName(favourite)}</div>
                {favourite.note && <div className="text-sm text-ink-soft truncate">{categoryNameOf(favourite)}</div>}
            </div>
            {/* A zero amount isn't $0 spent: it means "fill in when used",
                which starts a Draft (ADR0008, ADR0017). */}
            {hasNoAmount(favourite) ? (
                <span className="shrink-0 text-sm text-ink-soft">No amount</span>
            ) : (
                <SignedAmount transaction={favourite} className="shrink-0" />
            )}
        </>
    )
}
