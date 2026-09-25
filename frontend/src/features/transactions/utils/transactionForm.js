import { currentDate } from '@utils/date'
import { TRANSACTION_TYPES } from '@features/transactions/utils/transaction'

// Largest value numeric(12,2) can hold.
export const MAX_AMOUNT = 9999999999.99
export const MAX_AMOUNT_DECIMALS = 2
export const MAX_NOTE_LENGTH = 256

const AMOUNT_CHARS_RE = /^\d*\.?\d*$/

// A function, not a constant: `date` must be "today" when each new form
// mounts, not frozen at module-load time (a tab left open past midnight
// would otherwise default to yesterday).
export function emptyForm() {
    return {
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '0',
        date: currentDate(),
        note: '',
        categoryId: '',
    }
}

export function toFormShape(transaction) {
    return {
        type: transaction.type,
        amount: String(transaction.amount),
        date: transaction.date,
        note: transaction.note ?? '',
        categoryId: String(transaction.category?.id ?? ''),
    }
}

export function toPayload(form) {
    return {
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        note: form.note || null,
        categoryId: Number(form.categoryId),
    }
}

export function isFormDirty(form, initial) {
    return Object.keys(form).some((key) => form[key] !== initial[key])
}

// Classifies a raw amount keystroke result. The field is type="text" +
// inputMode="decimal" (iOS' type="number" keyboard includes -, comma…), so
// the browser no longer filters input for us:
//   - 'invalid'        → reject silently (not a digit / single dot)
//   - 'tooManyDecimals'→ reject, show a hint
//   - 'overMax'        → reject, show a hint
//   - 'ok'             → accept
export function checkAmountInput(value) {
    if (!AMOUNT_CHARS_RE.test(value)) return 'invalid'
    const decimalDigits = value.match(/\.(\d+)$/)?.[1]?.length ?? 0
    if (decimalDigits > MAX_AMOUNT_DECIMALS) return 'tooManyDecimals'
    if (value !== '' && Number(value) > MAX_AMOUNT) return 'overMax'
    return 'ok'
}
