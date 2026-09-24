import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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
import TransactionDetail from '../components/TransactionDetail'
import Money from '../components/Money'
import AddButton from '../components/AddButton'
import Card from '../components/Card'
import MonthBar from '../components/MonthBar'
import { categoryTileClasses } from '../lib/categorySwatch'
import { categoryIcon } from '../lib/categoryIcon'
import { groupByDay } from '../lib/dayGroups'
import { formatMonth } from '../lib/date'
import { useIsMobile } from '../hooks/useIsMobile'
import { useSelectedMonth } from '../hooks/useSelectedMonth'
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
    const [viewingDetail, setViewingDetail] = useState(null)
    const [error, setError] = useState(null)
    const isMobile = useIsMobile()
    const [month, setMonth] = useSelectedMonth()

    // Client-side for now (ADR0011): GET /api/transactions is unpaginated
    // and still returns the User's whole history, so this just narrows
    // what's displayed. Moves server-side once that endpoint is paginated.
    const monthTransactions = useMemo(
        () => (transactions ?? []).filter((t) => t.date.slice(0, 7) === month),
        [transactions, month]
    )

    const sorted = useMemo(
        () => [...monthTransactions].sort((a, b) => b.date.localeCompare(a.date)),
        [monthTransactions]
    )

    const dayGroups = useMemo(() => groupByDay(sorted), [sorted])

    // ADR0011: a saved Transaction dated outside the viewed month switches
    // the view to that month, so it never silently disappears.
    function switchToMonthOf(dateString) {
        const savedMonth = dateString.slice(0, 7)
        if (savedMonth !== month) setMonth(savedMonth)
    }

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
            switchToMonthOf(payload.date)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not add transaction.'))
        }
    }

    async function handleUpdate(payload) {
        setError(null)
        try {
            await updateTransaction.mutateAsync({ id: editing.id, ...payload })
            closeAny()
            switchToMonthOf(payload.date)
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
            {/* Title alone on its own row, matching Dashboard/Categories
                exactly — pairing Add with it made the row taller than a
                bare <h2> (Button's min-h-11), visibly misaligning
                "Transactions" against the other pages' headings. */}
            <h2 className="font-serif font-semibold text-2xl mb-4">Transactions</h2>
            {/* MonthBar + Add, single row, no wrap: MonthBar hides its
                "This month" text below sm: to leave room. */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <MonthBar month={month} onChange={setMonth} />
                {!showForm && !editing && <AddButton onClick={openCreate} />}
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

            {sorted.length === 0 && !isLoading && !showForm && !editing && (
                <div className="text-center py-12">
                    {/* No AddButton here — the header above already has one
                        (per ADR0011's "an Add action, not a blank list"),
                        and this page never hides the header's version, so a
                        second one here would just be a visible duplicate. */}
                    <p className="text-ink-soft text-sm">No transactions in {formatMonth(month)}.</p>
                </div>
            )}

            <div className="space-y-6">
                {dayGroups.map((group) => (
                    <div key={group.date}>
                        <div className="flex items-baseline justify-between mb-2 px-1">
                            <span className="text-sm">
                                {group.label.relative ? (
                                    <>
                                        <span className="font-medium">{group.label.relative}</span>{' '}
                                        <span className="text-ink-soft">{group.label.formatted}</span>
                                    </>
                                ) : (
                                    <span className="font-medium">{group.label.formatted}</span>
                                )}
                            </span>
                            <span className="text-sm text-ink-soft tabular">
                                <Money amount={group.total} />
                            </span>
                        </div>

                        <Card className="divide-y divide-rule-soft">
                            {group.transactions.map((t) => {
                                const Icon = categoryIcon(t.category?.name)
                                // Below md: no inline Edit/Delete \u2014 the row itself opens a
                                // read-only detail card instead (amended mobile-row spec,
                                // docs/backlog.md). At md: and up, Edit/Delete stay on the
                                // row and the note isn't truncated.
                                const rowContent = (
                                    <>
                                        <div
                                            className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${categoryTileClasses(t.category?.id ?? 0)}`}
                                        >
                                            <Icon aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="truncate min-w-0">{t.category?.name ?? 'Unknown category'}</span>
                                                {Number(t.amount) === 0 && (
                                                    <span className="text-xs font-medium text-brass-ink bg-brass/10 border border-brass/30 rounded-full px-2 py-0.5 shrink-0">
                                                        Draft
                                                    </span>
                                                )}
                                            </div>
                                            {t.note && (
                                                <div className="text-sm text-ink-soft truncate md:whitespace-normal md:overflow-visible">
                                                    {t.note}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`shrink-0 ${t.type === 'INCOME' ? 'text-deposit' : 'text-ink'}`}>
                                            {t.type === 'INCOME' ? '+' : '\u2212'}
                                            <Money amount={t.amount} />
                                        </span>
                                        {!isMobile && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEdit(t)}
                                                    aria-label="Edit"
                                                    className="h-11 w-11 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                                                >
                                                    <Pencil aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => requestDelete(t)}
                                                    disabled={deleteTransaction.isPending && deleteTransaction.variables === t.id}
                                                    aria-label="Delete"
                                                    className="h-11 w-11 flex items-center justify-center rounded-sm text-ink-soft hover:text-withdrawal disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    <Trash2 aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )

                                return isMobile ? (
                                    <button
                                        key={t.id}
                                        onClick={() => setViewingDetail(t)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                    >
                                        {rowContent}
                                    </button>
                                ) : (
                                    <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                                        {rowContent}
                                    </div>
                                )
                            })}
                        </Card>
                    </div>
                ))}
            </div>

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

            {viewingDetail && (
                <TransactionDetail
                    transaction={viewingDetail}
                    onClose={() => setViewingDetail(null)}
                    onEdit={() => {
                        setViewingDetail(null)
                        openEdit(viewingDetail)
                    }}
                    onDelete={() => {
                        setViewingDetail(null)
                        requestDelete(viewingDetail)
                    }}
                />
            )}
        </div>
    )
}