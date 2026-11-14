import { X } from 'lucide-react'
import { Sheet } from '@components/Sheet'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'

// Shared layout for a read-only detail card opened by tapping a list row
// below md: (a bottom sheet there, a centred modal at md:+). Used by
// TransactionDetail and FavouriteDetail so the two can't drift apart.
// Feature-specific pieces come in as elements: `tile` (the Category tile),
// `headerActions` (e.g. a star, placed before ✕) and `amount`.
// Edit and Delete hand off to the page's existing flows — no mutation
// logic lives here.
export function DetailSheet({ tile, headerActions, title, amount, meta, note, onClose, onEdit, onDelete }) {
    return (
        <Sheet onRequestClose={onClose}>
            <div className="flex items-start justify-between gap-3 mb-4">
                {tile}
                <div className="flex items-center -mr-2 -mt-1">
                    {headerActions}
                    <IconButton icon={X} label="Close" onClick={onClose} iconSize="h-5 w-5" />
                </div>
            </div>

            <div className="text-center mb-6">
                <div className="font-medium break-words">{title}</div>
                <div className="mt-1 flex items-center justify-center gap-2">{amount}</div>
                <div className="mt-1 text-sm text-ink-soft">{meta}</div>
                {note && <p className="mt-2 text-sm text-ink-soft break-words">{note}</p>}
            </div>

            {/* Delete sits apart from Edit so it's hard to hit by accident. */}
            <Button isFullWidth onClick={onEdit}>
                Edit
            </Button>
            <Button variant="dangerGhost" isFullWidth className="mt-4" onClick={onDelete}>
                Delete
            </Button>
        </Sheet>
    )
}
