import { Modal } from '@components/Modal'
import { StatusMessage } from '@components/StatusMessage'
import { TransactionForm } from '@features/transactions/components/TransactionForm'

export function TransactionFormModal({ transaction, categories, error, isSubmitting, onSubmit, onRequestClose, onDirtyChange }) {
    return (
        <Modal onRequestClose={onRequestClose}>
            {error && (
                <StatusMessage tone="error" className="mb-3">
                    {error}
                </StatusMessage>
            )}
            <TransactionForm
                key={transaction?.id ?? 'new'}
                categories={categories}
                initial={transaction}
                onSubmit={onSubmit}
                onCancel={onRequestClose}
                onDirtyChange={onDirtyChange}
                isSubmitting={isSubmitting}
            />
        </Modal>
    )
}
