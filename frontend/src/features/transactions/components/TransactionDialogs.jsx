import { ConfirmDialog } from '@components/ConfirmDialog'
import { TransactionDetail } from '@features/transactions/components/TransactionDetail'
import { describeTransaction } from '@features/transactions/utils/transaction'
import { ExitPresence } from '@components/ExitPresence'

// The page's secondary overlays: discard-changes confirm, delete confirm,
// and the mobile detail card.
export function TransactionDialogs({ discard, remove, detail, findMatchingFavourite, onFavouriteClick }) {
    return (
        <>
            <ExitPresence>
                {discard.isOpen && (
                    <ConfirmDialog
                        message="Discard unsaved changes?"
                        confirmLabel="Discard"
                        onConfirm={discard.confirm}
                        onCancel={discard.cancel}
                    />
                )}
            </ExitPresence>

            <ExitPresence>
                {remove.target && (
                    <ConfirmDialog
                        message={`Delete ${describeTransaction(remove.target)}? This can't be undone.`}
                        confirmLabel="Delete"
                        onConfirm={remove.confirm}
                        onCancel={remove.cancel}
                    />
                )}
            </ExitPresence>

            <ExitPresence>
                {detail.target && (
                    <TransactionDetail
                        transaction={detail.target}
                        onClose={detail.close}
                        isSavedAsFavourite={Boolean(findMatchingFavourite(detail.target))}
                        onFavouriteClick={() => onFavouriteClick(detail.target)}
                        onEdit={detail.edit}
                        onDelete={detail.delete}
                    />
                )}
            </ExitPresence>
        </>
    )
}
