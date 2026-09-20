import { useEffect, useRef, useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
    type: 'EXPENSE',
    amount: '0',
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

function isDirty(form, initial) {
    return Object.keys(form).some((key) => form[key] !== initial[key])
}

// Parent must pass a `key` (e.g. key={initial?.id ?? 'new'}) so switching
// between editing different transactions — or between edit and create —
// remounts this component instead of reusing state from the last one.
//
// onDirtyChange (optional): called with a boolean whenever the form's dirty
// state changes, so a parent wrapping this in a Modal can decide whether an
// outside-click close needs confirming. Pass a stable function (e.g. a
// useState setter) — a new function identity every render will still work
// but re-fires the effect unnecessarily.
export default function TransactionForm({ categories, initial, onSubmit, onCancel, submitting, onDirtyChange }) {
    const initialShape = useRef(initial ? toFormShape(initial) : emptyForm)
    const [form, setForm] = useState(initialShape.current)

    useEffect(() => {
        onDirtyChange?.(isDirty(form, initialShape.current))
        // Only re-run when form changes; initialShape is fixed for this mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form])

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
                    min="0"
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
                    onClick={(e) => e.target.showPicker?.()}
                    className={inputClass}
                />
            </div>

            {form.amount !== '' && Number(form.amount) === 0 && (
                <p className="col-span-2 -mt-1.5 text-xs text-ink-soft">Will show as a Draft (0 amount)</p>
            )}

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