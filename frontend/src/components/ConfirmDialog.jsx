import Modal from './Modal'

// A yes/no confirmation, styled consistently with the rest of the app and
// built on the same Modal shell used for the transaction Add/Edit forms.
// Clicking outside or Escape behaves the same as Cancel.
export default function ConfirmDialog({ message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
    return (
        <Modal onRequestClose={onCancel}>
            <p className="text-sm mb-4">{message}</p>
            <div className="flex gap-4">
                <button
                    onClick={onConfirm}
                    className="bg-withdrawal text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity"
                >
                    {confirmLabel}
                </button>
                <button onClick={onCancel} className="text-sm text-ink-soft hover:text-ink">
                    Cancel
                </button>
            </div>
        </Modal>
    )
}