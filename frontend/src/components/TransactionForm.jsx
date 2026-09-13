import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
    type: 'EXPENSE',
    amount: '',
    date: today(),
    note: '',
    categoryId: '',
}

function toFormShape(t) {
    return {
        type: t.type,
        amount: String(t.amount),
        date: t.date,
        note: t.note ?? '',
        categoryId: String(t.category?.id ?? ''),
    }
}

// Parent must pass a `key` (e.g. key={initial?.id ?? 'new'}) so switching
// between editing different transactions — or between edit and create —
// remounts this component instead of reusing state from the last one.
export default function TransactionForm({ categories, initial, onSubmit, onCancel, submitting }) {
    const [form, setForm] = useState(initial ? toFormShape(initial) : emptyForm)

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        onSubmit({
            type: form.type,
            amount: Number(form.amount),
            date: form.date,
            note: form.note || null,
            categoryId: Number(form.categoryId),
        })
    }

    const inputClass =
        'w-full border border-rule bg-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ink'

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex gap-4">
                {['EXPENSE', 'INCOME'].map((type) => (
                    <label key={type} className="flex items-center gap-1.5 text-sm">
                        <input
                            type="radio"
                            name="type"
                            checked={form.type === type}
                            onChange={() => update('type', type)}
                        />
                        {type === 'EXPENSE' ? 'Expense' : 'Income'}
                    </label>
                ))}
            </div>

            <div>
                <label className="block text-sm text-ink-soft mb-1">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm text-ink-soft mb-1">Date</label>
                <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm text-ink-soft mb-1">Category</label>
                <select
                    required
                    value={form.categoryId}
                    onChange={(e) => update('categoryId', e.target.value)}
                    className={inputClass}
                >
                    <option value="" disabled>Select one</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-ink-soft mb-1">Note (optional)</label>
                <input
                    type="text"
                    value={form.note}
                    onChange={(e) => update('note', e.target.value)}
                    className={inputClass}
                />
            </div>

            <div className="col-span-2 flex gap-4 pt-1">
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-ink text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {initial ? 'Save changes' : 'Add transaction'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-sm text-ink-soft hover:text-ink">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
