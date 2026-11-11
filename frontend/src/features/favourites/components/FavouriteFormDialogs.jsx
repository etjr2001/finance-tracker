import { ExitPresence } from '@components/ExitPresence'
import { DiscardChangesDialog } from '@components/DiscardChangesDialog'
import { FavouriteFormModal } from '@features/favourites/components/FavouriteFormModal'

// The Favourite add/edit form and its unsaved-changes confirm, driven by
// useFavouriteEditor(). Shared by the Favourites page and the Transactions
// page (the star on a Transaction opens it in place).
export function FavouriteFormDialogs({ editor, categories }) {
    const { error, form, discard } = editor
    return (
        <>
            <ExitPresence>
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
            </ExitPresence>
            <ExitPresence>
                {discard.isOpen && <DiscardChangesDialog onConfirm={discard.confirm} onCancel={discard.cancel} />}
            </ExitPresence>
        </>
    )
}
