import { emptyForm, toFormShape, toPayload } from '@features/transactions/utils/transactionForm'
import { useAmountFormState } from '@features/transactions/hooks/useAmountFormState'

// Form values for TransactionForm. Fixed for this mount: the parent
// remounts the form (via `key`) when switching between transactions or
// between edit and create.
export function useTransactionFormState(initialTransaction, onDirtyChange) {
    const { form, updateField, changeAmount, amountHint, isZeroAmount } = useAmountFormState(
        () => (initialTransaction ? toFormShape(initialTransaction) : emptyForm()),
        onDirtyChange
    )

    return {
        form,
        updateField,
        changeAmount,
        amountHint,
        isDraftAmount: isZeroAmount,
        toPayload: () => toPayload(form),
    }
}
