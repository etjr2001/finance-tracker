import { useState } from 'react'
import {
    useTransactions,
    useCreateTransaction,
    useUpdateTransaction,
    useDeleteTransaction,
} from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { apiErrorMessage } from '../api/client'

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionsPage() {
    const { data: transactions, isLoading, isError } = useTransactions()
    const { data: categories } = useCategories()
    const createTransaction = useCreateTransaction()
    const updateTransaction = useUpdateTransaction()
    const deleteTransaction = useDeleteTransaction()

    const [form, setForm] = useState({
        type: 'EXPENSE',
        amount: '',
        date: today(),
        note: '',
        categoryId: '',
    })
    const [error, setError] = useState(null)

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    async function handleCreate(e) {
        e.preventDefault()
        setError(null)
        try {
            await createTransaction.mutateAsync({
                type: form.type,
                amount: Number(form.amount),
                date: form.date,
                note: form.note || null,
                categoryId: Number(form.categoryId),
            })
            setForm({ type: 'EXPENSE', amount: '', date: today(), note: '', categoryId: '' })
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not add transaction.'))
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

    function categoryName(t) {
        return t.category?.name ?? 'Unknown category'
    }

    if (isLoading) return <div style={{ padding: 20 }}>Loading transactions…</div>
    if (isError) return <div style={{ padding: 20 }}>Could not load transactions.</div>

    return (
        <div style={{ padding: 20, maxWidth: 500 }}>
            <h1>Transactions</h1>

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
                <div>
                    <label>
                        <input
                            type="radio"
                            checked={form.type === 'EXPENSE'}
                            onChange={() => update('type', 'EXPENSE')}
                        /> Expense
                    </label>
                    {' '}
                    <label>
                        <input
                            type="radio"
                            checked={form.type === 'INCOME'}
                            onChange={() => update('type', 'INCOME')}
                        /> Income
                    </label>
                </div>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    required
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                />
                <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                />
                <select
                    required
                    value={form.categoryId}
                    onChange={(e) => update('categoryId', e.target.value)}
                >
                    <option value="" disabled>Select category</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Note (optional)"
                    value={form.note}
                    onChange={(e) => update('note', e.target.value)}
                />
                <button type="submit">Add transaction</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {transactions.map((t) => (
                    <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ddd' }}>
            <span>
              {t.date} — {categoryName(t)} {t.note ? `(${t.note})` : ''}
            </span>
                        <span>
              {t.type === 'INCOME' ? '+' : '-'}{t.amount}
                            {' '}
                            <button onClick={() => handleDelete(t.id)}>Delete</button>
            </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}