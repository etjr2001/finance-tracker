import { useCallback, useState } from 'react'
import { useCreateFavourite, useUpdateFavourite, useDeleteFavourite } from '@features/favourites/hooks/useFavourites'
import { apiErrorMessage } from '@api/httpClient'

// UI state machine for the Favourites page: which form (if any) is open,
// whether closing it needs a discard confirmation, the pending delete, and
// the shared error line. Same shape as useTransactionEditor, minus the
// month handling and detail card a Favourite doesn't have.
//
// Used by the Favourites page, and by the Transactions page for a
// Transaction's star (ADR0017), which opens the form in place.
export function useFavouriteEditor() {
    const createFavourite = useCreateFavourite()
    const updateFavourite = useUpdateFavourite()
    const deleteFavourite = useDeleteFavourite()

    // null (closed) | { favourite: null, prefill } (create; prefill is a
    // Transaction to start from, or null) | { favourite } (edit)
    const [formTarget, setFormTarget] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [error, setError] = useState(null)

    const editingFavourite = formTarget?.favourite ?? null
    const activeMutation = editingFavourite ? updateFavourite : createFavourite

    function openForm(favourite, prefill = null) {
        setError(null)
        setIsDirty(false)
        setFormTarget({ favourite, prefill })
    }

    function closeForm() {
        setFormTarget(null)
        setIsDirty(false)
    }

    const requestCloseForm = useCallback(() => {
        if (isDirty) {
            setIsDiscardConfirmOpen(true)
            return
        }
        setFormTarget(null)
    }, [isDirty])

    function confirmDiscard() {
        setIsDiscardConfirmOpen(false)
        closeForm()
    }

    async function submitForm(payload) {
        setError(null)
        try {
            if (editingFavourite) {
                await updateFavourite.mutateAsync({ id: editingFavourite.id, ...payload })
            } else {
                await createFavourite.mutateAsync(payload)
            }
            closeForm()
        } catch (err) {
            const fallback = editingFavourite ? 'Could not update favourite.' : 'Could not save favourite.'
            setError(apiErrorMessage(err, fallback))
        }
    }

    async function confirmDelete() {
        const { id } = deleteTarget
        setDeleteTarget(null)
        setError(null)
        try {
            await deleteFavourite.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete favourite.'))
        }
    }

    return {
        error,
        form: {
            isOpen: formTarget !== null,
            favourite: editingFavourite,
            prefill: formTarget?.prefill ?? null,
            isSubmitting: activeMutation.isPending,
            openCreate: () => openForm(null),
            // "Save as favourite": an Add form prefilled from a Transaction.
            openCreateFrom: (transaction) => openForm(null, transaction),
            openEdit: (favourite) => openForm(favourite),
            requestClose: requestCloseForm,
            submit: submitForm,
            setIsDirty,
        },
        discard: {
            isOpen: isDiscardConfirmOpen,
            confirm: confirmDiscard,
            cancel: () => setIsDiscardConfirmOpen(false),
        },
        remove: {
            target: deleteTarget,
            request: setDeleteTarget,
            confirm: confirmDelete,
            cancel: () => setDeleteTarget(null),
            isDeleting: (id) => deleteFavourite.isPending && deleteFavourite.variables === id,
        },
    }
}
