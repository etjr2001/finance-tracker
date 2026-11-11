import { ConfirmDialog } from '@components/ConfirmDialog'

// The unsaved-changes confirm every form modal shows when closed while
// dirty. Render it inside ExitPresence, like any other popup.
export function DiscardChangesDialog({ onConfirm, onCancel }) {
    return <ConfirmDialog message="Discard unsaved changes?" confirmLabel="Discard" onConfirm={onConfirm} onCancel={onCancel} />
}
