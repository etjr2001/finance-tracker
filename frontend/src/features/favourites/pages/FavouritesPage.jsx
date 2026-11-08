import { useMemo } from 'react'
import { PageTitle } from '@components/PageTitle'
import { AddButton } from '@components/AddButton'
import { StatusMessage } from '@components/StatusMessage'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useFavourites } from '@features/favourites/hooks/useFavourites'
import { useFavouriteEditor } from '@features/favourites/hooks/useFavouriteEditor'
import { FavouriteList } from '@features/favourites/components/FavouriteList'
import { FavouriteFormModal } from '@features/favourites/components/FavouriteFormModal'
import { describeFavourite, sortFavouritesByName } from '@features/favourites/utils/favouriteForm'

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
    const { error, form, discard, remove } = useFavouriteEditor()

    return (
        <div>
            <PageTitle>Favourites</PageTitle>
            <div className="flex items-center justify-between gap-3 mb-6">
                <p className="text-sm text-ink-soft">Shortcuts for the Add transaction form.</p>
                {!form.isOpen && <AddButton onClick={form.openCreate} />}
            </div>

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

            {form.isOpen && (
                <FavouriteFormModal
                    favourite={form.favourite}
                    prefill={form.prefill}
                    categories={categories}
                    error={error}
                    isSubmitting={form.isSubmitting}
                    onSubmit={form.submit}
                    onRequestClose={form.requestClose}
                    onDirtyChange={form.setIsDirty}
                />
            )}

            {discard.isOpen && (
                <ConfirmDialog
                    message="Discard unsaved changes?"
                    confirmLabel="Discard"
                    onConfirm={discard.confirm}
                    onCancel={discard.cancel}
                />
            )}

            {remove.target && (
                <ConfirmDialog
                    message={`Delete favourite "${describeFavourite(remove.target)}"? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={remove.confirm}
                    onCancel={remove.cancel}
                />
            )}
        </div>
    )
}
