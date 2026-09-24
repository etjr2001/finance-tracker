import { useMemo, useState } from 'react'
import {
    useTransactions,
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
} from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import TransactionForm from '../components/TransactionForm'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Money from '../components/Money'
import { apiErrorMessage } from '../api/client'

export default function TransactionsPage() {
    const { data: transactions, isLoading, isError } = useTransactions()
    const { data: categories } = useCategories()
    const createTransaction = useCreateTransaction()
    const updateTransaction = useUpdateTransaction()
    const deleteTransaction = useDeleteTransaction()

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [pendingCloseConfirm, setPendingCloseConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [error, setError] = useState(null)

    const sorted = useMemo(
        () => [...(transactions ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
        [transactions]
    )

    function openCreate() {
        setEditing(null)
        setIsDirty(false)
        setShowForm(true)
    }

    function openEdit(t) {
        setShowForm(false)
        setIsDirty(false)
        setEditing(t)
    }

    function closeAny() {
        setShowForm(false)
        setEditing(null)
        setIsDirty(false)
    }

    // Shared by the modal's outside-click/Escape handler and the form's own
    // Cancel button: silent close if the form is untouched, confirm via
    // ConfirmDialog if dirty.
    function requestClose() {
        if (isDirty) {
            setPendingCloseConfirm(true)
            return
        }
        closeAny()
    }

    function confirmDiscardChanges() {
        setPendingCloseConfirm(false)
        closeAny()
    }

    function cancelDiscardChanges() {
        setPendingCloseConfirm(false)
    }

    async function handleCreate(payload) {
        setError(null)
        try {
            await createTransaction.mutateAsync(payload)
            closeAny()
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not add transaction.'))
        }
    }

    async function handleUpdate(payload) {
        setError(null)
        try {
            await updateTransaction.mutateAsync({ id: editing.id, ...payload })
            closeAny()
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not update transaction.'))
        }
    }

    function deleteLabel(t) {
        return t.note
            ? `${t.category?.name ?? 'transaction'} — ${t.note}`
            : t.category?.name ?? 'this transaction'
    }

    function requestDelete(t) {
        setDeleteTarget(t)
    }

    async function confirmDelete() {
        const t = deleteTarget
        setDeleteTarget(null)
        setError(null)
        try {
            await deleteTransaction.mutateAsync(t.id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete transaction.'))
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif font-semibold text-2xl">Transactions</h2>
                {!showForm && !editing && (
                    <button
                        onClick={openCreate}
                        className="bg-ink text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity"
                    >
                        Add transaction
                    </button>
                )}
            </div>

            {error && !showForm && !editing && <p className="text-withdrawal text-sm mb-4">{error}</p>}

            {showForm && (
                <Modal onRequestClose={requestClose}>
                    {error && <p className="text-withdrawal text-sm mb-3">{error}</p>}
                    <TransactionForm
                        categories={categories}
                        onSubmit={handleCreate}
                        onCancel={requestClose}
                        onDirtyChange={setIsDirty}
                        submitting={createTransaction.isPending}
                    />
                </Modal>
            )}

            {editing && (
                <Modal onRequestClose={requestClose}>
                    {error && <p className="text-withdrawal text-sm mb-3">{error}</p>}
                    <TransactionForm
                        key={editing.id}
                        categories={categories}
                        initial={editing}
                        onSubmit={handleUpdate}
                        onCancel={requestClose}
                        onDirtyChange={setIsDirty}
                        submitting={updateTransaction.isPending}
                    />
                </Modal>
            )}

            {isLoading && <p className="text-ink-soft text-sm">Loading transactions…</p>}
            {isError && <p className="text-withdrawal text-sm">Could not load transactions.</p>}

            {sorted.length === 0 && !isLoading && (
                <p className="text-ink-soft text-sm">No transactions yet.</p>
            )}

            <ul className="divide-y divide-rule border-t border-b border-rule">
                {sorted.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-baseline gap-4 min-w-0">
                            <span className="text-sm text-ink-soft tabular w-24 shrink-0">{t.date}</span>
                            <div className="min-w-0">
                                <div className="truncate flex items-center gap-2">
                                    <span>{t.category?.name ?? 'Unknown category'}</span>
                                    {Number(t.amount) === 0 && (
                                        <span className="text-xs font-medium text-brass-ink bg-brass/10 border border-brass/30 rounded-full px-2 py-0.5 shrink-0">
                                            Draft
                                        </span>
                                    )}
                                </div>
                                {t.note && <div className="text-sm text-ink-soft truncate">{t.note}</div>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <span className={t.type === 'INCOME' ? 'text-deposit' : 'text-ink'}>
                                {t.type === 'INCOME' ? '+' : '\u2212'}
                                <Money amount={t.amount} />
                            </span>
                            <div className="flex gap-3 text-sm">
                                <button
                                    onClick={() => openEdit(t)}
                                    className="text-ink-soft hover:text-ink"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => requestDelete(t)}
                                    disabled={deleteTransaction.isPending && deleteTransaction.variables === t.id}
                                    className="text-ink-soft hover:text-withdrawal disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {pendingCloseConfirm && (
                <ConfirmDialog
                    message="Discard unsaved changes?"
                    confirmLabel="Discard"
                    onConfirm={confirmDiscardChanges}
                    onCancel={cancelDiscardChanges}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Delete ${deleteLabel(deleteTarget)}? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}