import { useEffect, useMemo, useState } from 'react'
import { checkAmountInput, isFormDirty } from '@features/transactions/utils/transactionForm'

// Shared by the Transaction and Favourite forms: field values, the
// amount-field guard, and dirtiness reported upward so a wrapping Modal can
// decide whether closing needs a confirmation. `createInitialForm` runs
// once per mount; the parent remounts the form (via `key`) to switch
// targets.
export function useAmountFormState(createInitialForm, onDirtyChange) {
    const [initialForm] = useState(createInitialForm)
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

    // Overwrites several fields at once (e.g. from a Favourite). The amount
    // comes from saved data, not a keystroke, so any blocked-keystroke hint
    // no longer applies.
    function fillFields(fields) {
        setForm((previous) => ({ ...previous, ...fields }))
        setAmountHint(null)
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
        fillFields,
        changeAmount,
        amountHint,
        isZeroAmount: form.amount !== '' && Number(form.amount) === 0,
    }
}
