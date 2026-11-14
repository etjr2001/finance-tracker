import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@components/Card'
import { IconButton } from '@components/IconButton'
import { StatusMessage } from '@components/StatusMessage'
import { FavouriteSummary } from '@features/favourites/components/FavouriteSummary'

const ROW_CLASS = 'flex items-center gap-3 py-3 pl-4'

// Every Favourite, in the order given (the page sorts A–Z). Same pattern as
// a Transaction row: below md: the whole row is a button opening the
// FavouriteDetail card, with no inline actions, so the name gets the full
// width (two 44px icon buttons truncated it on a phone). At md:+ the row
// keeps inline Edit and Delete.
export function FavouriteList({ favourites, isLoading, hasError, isMobile, isDeleting, onOpenDetail, onEdit, onDelete }) {
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
            {favourites.map((favourite) =>
                isMobile ? (
                    <button
                        key={favourite.id}
                        onClick={() => onOpenDetail(favourite)}
                        className={`w-full text-left pr-4 ${ROW_CLASS}`}
                    >
                        <FavouriteSummary favourite={favourite} />
                    </button>
                ) : (
                    <div key={favourite.id} className={`pr-2 ${ROW_CLASS}`}>
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
                )
            )}
        </Card>
    )
}
