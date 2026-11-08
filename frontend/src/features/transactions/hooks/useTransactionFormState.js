import { emptyForm, toFormShape, toPayload } from '@features/transactions/utils/transactionForm'
import { useAmountFormState } from '@features/transactions/hooks/useAmountFormState'
import { toFavouriteFormShape } from '@features/favourites/utils/favouriteForm'

// Form values for TransactionForm. Fixed for this mount: the parent
// remounts the form (via `key`) when switching between transactions or
// between edit and create.
export function useTransactionFormState(initialTransaction, onDirtyChange) {
    const { form, updateField, fillFields, changeAmount, amountHint, isZeroAmount } = useAmountFormState(
        () => (initialTransaction ? toFormShape(initialTransaction) : emptyForm()),
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
