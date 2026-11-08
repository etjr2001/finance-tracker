import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@components/Card'
import { IconButton } from '@components/IconButton'
import { StatusMessage } from '@components/StatusMessage'
import { FavouriteSummary } from '@features/favourites/components/FavouriteSummary'

// Every Favourite, in the order given (the page sorts A–Z). Edit and Delete stay
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
                    <FavouriteSummary favourite={favourite} />
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
