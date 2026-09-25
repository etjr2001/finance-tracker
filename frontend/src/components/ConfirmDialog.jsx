import { Modal } from '@components/Modal'
import { Button } from '@components/Button'

// Yes/no confirmation on the shared Modal shell. Outside click or Escape
// behaves the same as Cancel.
export function ConfirmDialog({ message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
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
