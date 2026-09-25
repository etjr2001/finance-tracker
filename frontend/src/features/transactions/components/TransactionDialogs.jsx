import { ConfirmDialog } from '@components/ConfirmDialog'
import { TransactionDetail } from '@features/transactions/components/TransactionDetail'
import { describeTransaction } from '@features/transactions/utils/transaction'

// The page's secondary overlays: discard-changes confirm, delete confirm,
// and the mobile detail card.
export function TransactionDialogs({ discard, remove, detail }) {
    return (
        <>
            {discard.isOpen && (
                <ConfirmDialog
                    message="Discard unsaved changes?"
                    confirmLabel="Discard"
                    onConfirm={discard.confirm}
                    onCancel={discard.cancel}
                />
            )}

            {remove.target && (
                <ConfirmDialog
                    message={`Delete ${describeTransaction(remove.target)}? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={remove.confirm}
                    onCancel={remove.cancel}
                />
            )}

            {detail.target && (
                <TransactionDetail
                    transaction={detail.target}
                    onClose={detail.close}
                    onEdit={detail.edit}
                    onDelete={detail.delete}
                />
            )}
        </>
    )
}
