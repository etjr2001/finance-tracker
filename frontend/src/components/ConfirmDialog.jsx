import Modal from './Modal'
import Button from './Button'

// A yes/no confirmation, styled consistently with the rest of the app and
// built on the same Modal shell used for the transaction Add/Edit forms.
// Clicking outside or Escape behaves the same as Cancel.
export default function ConfirmDialog({ message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
    return (
        <Modal onRequestClose={onCancel}>
            <p className="text-sm mb-4">{message}</p>
            <div className="flex gap-4">
                <Button variant="danger" onClick={onConfirm}>
                    {confirmLabel}
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
