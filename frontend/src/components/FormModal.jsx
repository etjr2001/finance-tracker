import { Modal } from '@components/Modal'
import { StatusMessage } from '@components/StatusMessage'

// Shell shared by the add/edit form modals: a Modal with the save error
// (if any) above the form passed as children.
export function FormModal({ error, onRequestClose, children }) {
    return (
        <Modal onRequestClose={onRequestClose}>
            {error && (
                <StatusMessage tone="error" className="mb-3">
                    {error}
                </StatusMessage>
            )}
            {children}
        </Modal>
    )
}
