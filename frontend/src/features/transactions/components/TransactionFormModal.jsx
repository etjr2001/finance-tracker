import { FormModal } from '@components/FormModal'
import { TransactionForm } from '@features/transactions/components/TransactionForm'

export function TransactionFormModal({ transaction, categories, error, isSubmitting, onSubmit, onRequestClose, onDirtyChange }) {
    return (
        <FormModal error={error} onRequestClose={onRequestClose}>
            <TransactionForm
                key={transaction?.id ?? 'new'}
                categories={categories}
                initial={transaction}
                onSubmit={onSubmit}
                onCancel={onRequestClose}
                onDirtyChange={onDirtyChange}
                isSubmitting={isSubmitting}
            />
        </FormModal>
    )
}
