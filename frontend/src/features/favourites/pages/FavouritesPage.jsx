import { useMemo } from 'react'
import { PageTitle } from '@components/PageTitle'
import { PageToolbar } from '@components/PageToolbar'
import { StatusMessage } from '@components/StatusMessage'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useFavourites } from '@features/favourites/hooks/useFavourites'
import { useFavouriteEditor } from '@features/favourites/hooks/useFavouriteEditor'
import { FavouriteList } from '@features/favourites/components/FavouriteList'
import { FavouriteFormDialogs } from '@features/favourites/components/FavouriteFormDialogs'
import { describeFavourite, sortFavouritesByName } from '@features/favourites/utils/favouriteForm'
import { ExitPresence } from '@components/ExitPresence'

// Add, edit and delete Favourites. Nothing here creates a Transaction:
// Favourites are only used from the Add transaction form (ADR0017).
export function FavouritesPage() {
    const { data: categories } = useCategories()
    const { data: favourites, isLoading, isError } = useFavourites()
    // A–Z, the same order as the picker in the Transaction form.
    const sortedFavourites = useMemo(
        () => (favourites ? sortFavouritesByName(favourites) : favourites),
        [favourites]
    )
    const editor = useFavouriteEditor()
    const { error, form, remove } = editor

    return (
        <div>
            <PageTitle>Favourites</PageTitle>
            <PageToolbar onAdd={form.openCreate}>
                <p className="text-sm text-ink-soft">Shortcuts for the Add transaction form.</p>
            </PageToolbar>

            {/* While a form is open, its modal shows the error instead. */}
            {error && !form.isOpen && (
                <StatusMessage tone="error" className="mb-4">
                    {error}
                </StatusMessage>
            )}

            <FavouriteList
                favourites={sortedFavourites}
                isLoading={isLoading}
                hasError={isError}
                isDeleting={remove.isDeleting}
                onEdit={form.openEdit}
                onDelete={remove.request}
            />

            <FavouriteFormDialogs editor={editor} categories={categories} />

            <ExitPresence>
                {remove.target && (
                    <ConfirmDialog
                        message={`Delete favourite "${describeFavourite(remove.target)}"? This can't be undone.`}
                        confirmLabel="Delete"
                        onConfirm={remove.confirm}
                        onCancel={remove.cancel}
                    />
                )}
            </ExitPresence>
        </div>
    )
}
