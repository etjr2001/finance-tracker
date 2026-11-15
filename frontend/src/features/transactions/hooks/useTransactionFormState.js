import { emptyForm, toCopyFormShape, toFormShape, toPayload } from '@features/transactions/utils/transactionForm'
import { useAmountFormState } from '@features/transactions/hooks/useAmountFormState'
import { toFavouriteFormShape } from '@features/favourites/utils/favouriteForm'

function initialFormFor(initialTransaction, copyFrom) {
    if (initialTransaction) return toFormShape(initialTransaction)
    if (copyFrom) return toCopyFormShape(copyFrom)
    return emptyForm()
}

// Form values for TransactionForm. Fixed for this mount: the parent
// remounts the form (via `key`) when switching between transactions or
// between edit, copy and create. A copy's prefill is its starting point,
// so closing it untouched isn't "unsaved changes".
export function useTransactionFormState(initialTransaction, onDirtyChange, copyFrom = null) {
    const { form, updateField, fillFields, changeAmount, amountHint, isZeroAmount } = useAmountFormState(
        () => initialFormFor(initialTransaction, copyFrom),
        onDirtyChange
    )

    return {
        form,
        updateField,
        changeAmount,
        amountHint,
        isDraftAmount: isZeroAmount,
        // A Favourite's form shape is the Transaction's minus the date, so
        // using one fills type, amount, Category and note and leaves the
        // date as it is (ADR0017).
        applyFavourite: (favourite) => fillFields(toFavouriteFormShape(favourite)),
        toPayload: () => toPayload(form),
    }
}
