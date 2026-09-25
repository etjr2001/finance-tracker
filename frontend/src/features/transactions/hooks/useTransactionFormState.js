import { useEffect, useMemo, useState } from 'react'
import { checkAmountInput, emptyForm, isFormDirty, toFormShape, toPayload } from '@features/transactions/utils/transactionForm'

// Form values for TransactionForm plus the amount-field guard. Reports
// dirtiness upward so a wrapping Modal can decide whether closing needs a
// confirmation.
export function useTransactionFormState(initialTransaction, onDirtyChange) {
    // Lazy, fixed for this mount: the parent remounts the form (via `key`)
    // when switching between transactions or between edit and create.
    const [initialForm] = useState(() => (initialTransaction ? toFormShape(initialTransaction) : emptyForm()))
    const [form, setForm] = useState(initialForm)
    // null | 'tooManyDecimals' | 'overMax' — a blocked keystroke must show
    // *why*, or it reads as a broken field (especially on mobile).
    const [amountHint, setAmountHint] = useState(null)

    const isDirty = useMemo(() => isFormDirty(form, initialForm), [form, initialForm])

    useEffect(() => {
        onDirtyChange?.(isDirty)
    }, [isDirty, onDirtyChange])

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }))
    }

    function changeAmount(value) {
        const result = checkAmountInput(value)
        if (result === 'invalid') return
        if (result !== 'ok') {
            setAmountHint(result)
            return
        }
        setAmountHint(null)
        updateField('amount', value)
    }

    return {
        form,
        updateField,
        changeAmount,
        amountHint,
        isDraftAmount: form.amount !== '' && Number(form.amount) === 0,
        toPayload: () => toPayload(form),
    }
}
