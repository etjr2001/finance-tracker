import { useMemo, useState } from 'react'
import {
    useTransactions,
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
} from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import TransactionForm from '../components/TransactionForm'
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
    const [error, setError] = useState(null)

    const sorted = useMemo(
        () => [...(transactions ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
        [transactions]
    )

    async function handleCreate(payload) {
        setError(null)
        try {
            await createTransaction.mutateAsync(payload)
            setShowForm(false)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not add transaction.'))
        }
    }

    async function handleUpdate(payload) {
        setError(null)
        try {
            await updateTransaction.mutateAsync({ id: editing.id, ...payload })
            setEditing(null)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not update transaction.'))
        }
    }

    async function handleDelete(id) {
        setError(null)
        try {
            await deleteTransaction.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete transaction.'))
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl">Transactions</h2>
                {!showForm && !editing && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-ink text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity"
                    >
                        Add transaction
                    </button>
                )}
            </div>

            {error && <p className="text-withdrawal text-sm mb-4">{error}</p>}

            {showForm && (
                <div className="mb-8 p-5 bg-paper-raised rounded-sm">
                    <TransactionForm
                        categories={categories}
                        onSubmit={handleCreate}
                        onCancel={() => setShowForm(false)}
                        submitting={createTransaction.isPending}
                    />
                </div>
            )}

            {editing && (
                <div className="mb-8 p-5 bg-paper-raised rounded-sm">
                    <TransactionForm
                        key={editing.id}
                        categories={categories}
                        initial={editing}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditing(null)}
                        submitting={updateTransaction.isPending}
                    />
                </div>
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
                                <div className="truncate">{t.category?.name ?? 'Unknown category'}</div>
                                {t.note && <div className="text-sm text-ink-soft truncate">{t.note}</div>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <span className={t.type === 'INCOME' ? 'text-deposit' : 'text-withdrawal'}>
                                {t.type === 'INCOME' ? '+' : '\u2212'}
                                <Money amount={t.amount} />
                            </span>
                            <div className="flex gap-3 text-sm">
                                <button
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditing(t)
                                    }}
                                    className="text-ink-soft hover:text-ink"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="text-ink-soft hover:text-withdrawal"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
