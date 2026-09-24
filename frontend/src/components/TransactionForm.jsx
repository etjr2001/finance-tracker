import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateCategory } from '../hooks/useCategories'
import { apiErrorMessage } from '../api/client'
import Modal from './Modal'
import Button from './Button'
import FormField, { inputClass } from './FormField'
import { ChevronDown } from 'lucide-react'

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

    // The field is type="text" + inputMode="decimal", not type="number":
    // iOS Safari's number keyboard is the "numbers and punctuation" page
    // (includes -, comma), not the clean 0-9 + decimal keypad that decimal
    // inputMode gives on both iOS and Android. That means the browser no
    // longer filters keystrokes for us, so this rejects anything that isn't
    // a digit or a single decimal point outright (silently — there was
    // never visible feedback for a stray letter/minus with type="number"
    // either, since the browser just refused the keystroke).
    //
    // On top of that, blocks keystrokes that would push the amount past
    // what numeric(12,2) can hold, or past its 2-decimal-place scale,
    // rather than only warning on submit — but silently blocking input
    // with no feedback there reads as broken, especially on mobile where
    // the field may be scrolled off-screen behind the keyboard, so those
    // two drive a visible hint instead.
    function handleAmountChange(e) {
        const value = e.target.value
        if (!/^\d*\.?\d*$/.test(value)) {
            return
        }

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
                    <label className="block text-sm text-ink-soft mb-1" htmlFor="amount">Amount</label>
                    <input
                        id="amount"
                        type="text"
                        inputMode="decimal"
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
                    <label className="block text-sm text-ink-soft mb-1" htmlFor="date">Date</label>
                    <input
                        id="date"
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
                    <label className="block text-sm text-ink-soft mb-1" htmlFor="categoryId">Category</label>
                    <div className="relative">
                        <select
                            id="categoryId"
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
                        <ChevronDown
                            aria-hidden="true"
                            strokeWidth={1.7}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
                        />
                    </div>
                </div>

                <FormField
                    label="Note (optional)"
                    htmlFor="note"
                    type="text"
                    maxLength={256}
                    value={form.note}
                    onChange={(e) => update('note', e.target.value)}
                />

                <div className="md:col-span-2 flex gap-4 pt-1">
                    <Button type="submit" disabled={submitting}>
                        {initial ? 'Save changes' : 'Add transaction'}
                    </Button>
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            {addingCategory && (
                <Modal onRequestClose={cancelAddingCategory}>
                    <FormField
                        label="New category name"
                        htmlFor="newCategoryName"
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
                    />
                    {newCategoryError && <p className="mt-1 text-xs text-withdrawal">{newCategoryError}</p>}
                    <div className="flex gap-4 mt-4">
                        <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>
                            Create
                        </Button>
                        <Button variant="ghost" onClick={cancelAddingCategory}>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}
        </>
    )
}