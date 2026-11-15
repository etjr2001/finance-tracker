import { FormModal } from '@components/FormModal'
import { TransactionForm } from '@features/transactions/components/TransactionForm'

// The key remounts the form for each target: an edit, a copy of a given
// Transaction, or a blank Add.
function formKey(transaction, copyFrom) {
    if (transaction) return transaction.id
    return copyFrom ? `copy-${copyFrom.id}` : 'new'
}

export function TransactionFormModal({ transaction, copyFrom = null, categories, error, isSubmitting, onSubmit, onRequestClose, onDirtyChange }) {
    return (
        <FormModal error={error} onRequestClose={onRequestClose}>
            <TransactionForm
                key={formKey(transaction, copyFrom)}
                categories={categories}
                initial={transaction}
                copyFrom={copyFrom}
                onSubmit={onSubmit}
                onCancel={onRequestClose}
                onDirtyChange={onDirtyChange}
                isSubmitting={isSubmitting}
            />
        </FormModal>
    )
}
