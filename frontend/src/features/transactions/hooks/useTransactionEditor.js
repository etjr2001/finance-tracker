import { useCallback, useState } from 'react'
import {
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
} from '@features/transactions/hooks/useTransactions'
import { apiErrorMessage } from '@api/httpClient'
import { monthOf } from '@utils/date'

// UI state machine for the Transactions page: which form (if any) is open,
// whether closing it needs a discard confirmation, the pending delete, the
// mobile detail card, and the shared error line. Mutations live here too,
// so the page component only renders.
export function useTransactionEditor({ month, onMonthChange }) {
    const createTransaction = useCreateTransaction()
    const updateTransaction = useUpdateTransaction()
    const deleteTransaction = useDeleteTransaction()

    // null (closed) | { transaction: null } (create) | { transaction } (edit)
    const [formTarget, setFormTarget] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [detailTarget, setDetailTarget] = useState(null)
    const [error, setError] = useState(null)

    const isFormOpen = formTarget !== null
    const editingTransaction = formTarget?.transaction ?? null
    const activeMutation = editingTransaction ? updateTransaction : createTransaction

    function openForm(transaction) {
        setIsDirty(false)
        setFormTarget({ transaction })
    }

    function closeForm() {
        setFormTarget(null)
        setIsDirty(false)
    }

    // Stable: Modal re-binds its Escape listener whenever this changes.
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

    // ADR0011: a Transaction saved outside the viewed month switches the
    // view to its month, so it never silently disappears.
    function showMonthOf(dateString) {
        const savedMonth = monthOf(dateString)
        if (savedMonth !== month) onMonthChange(savedMonth)
    }

    async function submitForm(payload) {
        setError(null)
        try {
            if (editingTransaction) {
                await updateTransaction.mutateAsync({ id: editingTransaction.id, ...payload })
            } else {
                await createTransaction.mutateAsync(payload)
            }
            closeForm()
            showMonthOf(payload.date)
        } catch (err) {
            const fallback = editingTransaction ? 'Could not update transaction.' : 'Could not add transaction.'
            setError(apiErrorMessage(err, fallback))
        }
    }

    async function confirmDelete() {
        const { id } = deleteTarget
        setDeleteTarget(null)
        setError(null)
        try {
            await deleteTransaction.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete transaction.'))
        }
    }

    // Detail card (mobile) hands off to the same edit/delete flows.
    function editFromDetail() {
        setDetailTarget(null)
        openForm(detailTarget)
    }

    function deleteFromDetail() {
        setDetailTarget(null)
        setDeleteTarget(detailTarget)
    }

    return {
        error,
        form: {
            isOpen: isFormOpen,
            transaction: editingTransaction,
            isSubmitting: activeMutation.isPending,
            openCreate: () => openForm(null),
            openEdit: openForm,
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
            isDeleting: (id) => deleteTransaction.isPending && deleteTransaction.variables === id,
        },
        detail: {
            target: detailTarget,
            open: setDetailTarget,
            close: () => setDetailTarget(null),
            edit: editFromDetail,
            delete: deleteFromDetail,
        },
    }
}
