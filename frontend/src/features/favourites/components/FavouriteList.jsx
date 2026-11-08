import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@components/Card'
import { IconButton } from '@components/IconButton'
import { StatusMessage } from '@components/StatusMessage'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { categoryNameOf } from '@features/transactions/utils/transaction'
import { hasNoAmount } from '@features/favourites/utils/favouriteForm'

// Every Favourite, newest first (the API's order). Edit and Delete stay
// inline at every width: unlike a Transaction row there's no detail card
// to hand off to, and the row is short enough to fit both on a phone.
export function FavouriteList({ favourites, isLoading, hasError, isDeleting, onEdit, onDelete }) {
    if (isLoading) return <StatusMessage>Loading favourites…</StatusMessage>
    if (hasError) return <StatusMessage tone="error">Could not load favourites.</StatusMessage>
    if (!favourites?.length) {
        return (
            <StatusMessage className="text-center py-12">
                No favourites yet. Save one for anything you enter often, then pick it from the Add transaction form.
            </StatusMessage>
        )
    }

    return (
        <Card className="divide-y divide-rule-soft">
            {favourites.map((favourite) => (
                <div key={favourite.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
                    <CategoryTile colorKey={favourite.category?.colorKey} iconKey={favourite.category?.iconKey} />
                    {/* The note names the Favourite when there is one, with
                        its Category underneath; otherwise the Category alone. */}
                    <div className="min-w-0 flex-1">
                        <div className="truncate">{favourite.note || categoryNameOf(favourite)}</div>
                        {favourite.note && (
                            <div className="text-sm text-ink-soft truncate">{categoryNameOf(favourite)}</div>
                        )}
                    </div>
                    {/* A zero amount isn't $0 spent: it means "fill in when
                        used", which starts a Draft (ADR0008, ADR0017). */}
                    {hasNoAmount(favourite) ? (
                        <span className="shrink-0 text-sm text-ink-soft">No amount</span>
                    ) : (
                        <SignedAmount transaction={favourite} className="shrink-0" />
                    )}
                    <div className="flex shrink-0 items-center">
                        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(favourite)} />
                        <IconButton
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            isDisabled={isDeleting(favourite.id)}
                            onClick={() => onDelete(favourite)}
                        />
                    </div>
                </div>
            ))}
        </Card>
    )
}
