import { Star, X } from 'lucide-react'
import { Sheet } from '@components/Sheet'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { CategoryTile } from '@features/categories/components/CategoryTile'
import { SignedAmount } from '@features/transactions/components/SignedAmount'
import { DraftBadge } from '@features/transactions/components/DraftBadge'
import { dayGroupLabel } from '@features/transactions/utils/dayGroups'
import { categoryNameOf, isDraft, isIncome } from '@features/transactions/utils/transaction'

// Read-only detail card opened by tapping a row below md: (a bottom sheet
// there, a centred modal at md:+). The star, Edit and Delete hand off to the
// page's existing flows — no mutation logic lives here.
//
// `isSavedAsFavourite`: the Transaction matches one of the User's
// Favourites (favouriteMatch.js), so the star is filled. What tapping it
// does in each state is up to the page.
export function TransactionDetail({ transaction, isSavedAsFavourite = false, onClose, onFavouriteClick, onEdit, onDelete }) {
    const { formatted: formattedDate } = dayGroupLabel(transaction.date)
    const typeLabel = isIncome(transaction) ? 'Income' : 'Expense'

    return (
        // Close slides the sheet down first; the star, Edit and Delete open
        // another dialog straight away, so they skip the slide.
        <Sheet onRequestClose={onClose}>
            {({ close }) => (
                <>
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <CategoryTile
                            colorKey={transaction.category?.colorKey}
                            iconKey={transaction.category?.iconKey}
                            size="lg"
                        />
                        <div className="flex items-center -mr-2 -mt-1">
                            <IconButton
                                icon={Star}
                                label={isSavedAsFavourite ? 'Saved as favourite' : 'Save as favourite'}
                                isIconFilled={isSavedAsFavourite}
                                tone={isSavedAsFavourite ? 'accent' : 'neutral'}
                                iconSize="h-5 w-5"
                                onClick={onFavouriteClick}
                            />
                            <IconButton icon={X} label="Close" onClick={() => close()} iconSize="h-5 w-5" />
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <div className="font-medium break-words">{categoryNameOf(transaction)}</div>
                        {/* Individual expenses in ink, income in deposit (ADR0010);
                            the sign says which. */}
                        <div className="mt-1 flex items-center justify-center gap-2">
                            <SignedAmount
                                transaction={transaction}
                                className="font-serif font-semibold text-3xl tabular"
                            />
                            {isDraft(transaction) && <DraftBadge />}
                        </div>
                        <div className="mt-1 text-sm text-ink-soft">
                            {formattedDate} · {typeLabel}
                        </div>
                        {transaction.note && (
                            <p className="mt-2 text-sm text-ink-soft break-words">{transaction.note}</p>
                        )}
                    </div>

                    {/* Delete sits apart from Edit so it's hard to hit by accident. */}
                    <Button isFullWidth onClick={onEdit}>
                        Edit
                    </Button>
                    <Button variant="dangerGhost" isFullWidth className="mt-4" onClick={onDelete}>
                        Delete
                    </Button>
                </>
            )}
        </Sheet>
    )
}
