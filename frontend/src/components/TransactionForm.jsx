import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateCategory } from '../hooks/useCategories'
import { apiErrorMessage } from '../api/client'
import Modal from './Modal'

const NEW_CATEGORY_VALUE = '__new__'
const MAX_AMOUNT = 9999999999.99

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
    const [amountAtMax, setAmountAtMax] = useState(false)
    const [amountTooManyDecimals, setAmountTooManyDecimals] = useState(false)

    const [addingCategory, setAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryError, setNewCategoryError] = useState(null)
    // Freshly created category, kept locally until it shows up in `categories`
    // (which comes from the parent's query and refetches asynchronously) so
    // the select has something to display as selected in the meantime.
    const [pendingNewCategory, setPendingNewCategory] = useState(null)
    const createCategory = useCreateCategory()

    const sortedCategories = useMemo(() => {
        const list = [...(categories ?? [])]
        if (pendingNewCategory && !list.some((c) => c.id === pendingNewCategory.id)) {
            list.push(pendingNewCategory)
        }
        return list.sort((a, b) => a.name.localeCompare(b.name))
    }, [categories, pendingNewCategory])

    useEffect(() => {
        onDirtyChange?.(isDirty(form, initialShape.current))
        // Only re-run when form changes; initialShape is fixed for this mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form])

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    // Blocks keystrokes that would push the amount past what numeric(12,2)
    // can hold, or past its 2-decimal-place scale, rather than only warning
    // on submit — but silently blocking input with no feedback reads as
    // broken, especially on mobile where the field may be scrolled
    // off-screen behind the keyboard, so these drive a visible hint instead.
    function handleAmountChange(e) {
        const value = e.target.value
        const decimalDigits = value.match(/\.(\d+)$/)?.[1]?.length ?? 0
        if (decimalDigits > 2) {
            setAmountTooManyDecimals(true)
            return
        }
        setAmountTooManyDecimals(false)

        if (value !== '' && Number(value) > MAX_AMOUNT) {
            setAmountAtMax(true)
            return
        }
        setAmountAtMax(false)
        update('amount', value)
    }

    function handleCategorySelectChange(e) {
        const value = e.target.value
        if (value === NEW_CATEGORY_VALUE) {
            setAddingCategory(true)
            setNewCategoryName('')
            setNewCategoryError(null)
            return
        }
        update('categoryId', value)
    }

    function cancelAddingCategory() {
        setAddingCategory(false)
        setNewCategoryName('')
        setNewCategoryError(null)
    }

    async function handleCreateCategory() {
        const name = newCategoryName.trim()
        if (!name) return
        setNewCategoryError(null)

        // Case-insensitive dedup: reuse an existing category instead of
        // creating a near-duplicate (e.g. typing "groceries" when
        // "Groceries" already exists).
        const existing = sortedCategories.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (existing) {
            update('categoryId', String(existing.id))
            setAddingCategory(false)
            return
        }

        try {
            const created = await createCategory.mutateAsync({ name })
            setPendingNewCategory(created)
            update('categoryId', String(created.id))
            setAddingCategory(false)
        } catch (err) {
            setNewCategoryError(apiErrorMessage(err, 'Could not create category.'))
        }
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

    // text-base (16px), not text-sm: iOS Safari auto-zooms the viewport on
    // focus for any input under 16px, and doesn't reliably zoom back out.
    const inputClass =
        'w-full border border-rule bg-white px-3 py-2 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-ink'

    return (
        <>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 flex gap-4">
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
                        max={MAX_AMOUNT}
                        required
                        value={form.amount}
                        onChange={handleAmountChange}
                        onFocus={(e) => e.target.select()}
                        className={`${inputClass} ${Number(form.amount) === 0 ? 'text-ink-soft' : ''}`}
                    />
                    {amountAtMax && (
                        <p className="mt-1 text-xs text-withdrawal">Max amount is 9,999,999,999.99</p>
                    )}
                    {amountTooManyDecimals && (
                        <p className="mt-1 text-xs text-withdrawal">Only 2 decimal places allowed</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm text-ink-soft mb-1">Date</label>
                    <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => update('date', e.target.value)}
                        onClick={(e) => e.target.showPicker?.()}
                        className={`${inputClass} appearance-none [-webkit-appearance:none]`}
                    />
                </div>

                {form.amount !== '' && Number(form.amount) === 0 && (
                    <p className="md:col-span-2 -mt-1.5 text-xs text-ink-soft">Will show as a Draft (0 amount)</p>
                )}

                <div>
                    <label className="block text-sm text-ink-soft mb-1">Category</label>
                    <div className="relative">
                        <select
                            required
                            value={form.categoryId}
                            onChange={handleCategorySelectChange}
                            className={`${inputClass} appearance-none [-webkit-appearance:none] [-moz-appearance:none] pr-8`}
                        >
                            <option value="" disabled>Select one</option>
                            {sortedCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-ink-soft mb-1">Note (optional)</label>
                    <input
                        type="text"
                        maxLength={256}
                        value={form.note}
                        onChange={(e) => update('note', e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="md:col-span-2 flex gap-4 pt-1">
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

            {addingCategory && (
                <Modal onRequestClose={cancelAddingCategory}>
                    <label className="block text-sm text-ink-soft mb-1">New category name</label>
                    <input
                        autoFocus
                        type="text"
                        maxLength={50}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreateCategory()
                            }
                        }}
                        placeholder="Category name"
                        className={inputClass}
                    />
                    {newCategoryError && <p className="mt-1 text-xs text-withdrawal">{newCategoryError}</p>}
                    <div className="flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={createCategory.isPending}
                            className="bg-ink text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            Create
                        </button>
                        <button type="button" onClick={cancelAddingCategory} className="text-sm text-ink-soft hover:text-ink">
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </>
    )
}