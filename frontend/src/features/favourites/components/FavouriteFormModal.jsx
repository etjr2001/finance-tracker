import { Modal } from '@components/Modal'
import { StatusMessage } from '@components/StatusMessage'
import { FavouriteForm } from '@features/favourites/components/FavouriteForm'

export function FavouriteFormModal({ favourite, categories, error, isSubmitting, onSubmit, onRequestClose, onDirtyChange }) {
    return (
        <Modal onRequestClose={onRequestClose}>
            {error && (
                <StatusMessage tone="error" className="mb-3">
                    {error}
                </StatusMessage>
            )}
            <FavouriteForm
                key={favourite?.id ?? 'new'}
                categories={categories}
                initial={favourite}
                onSubmit={onSubmit}
                onCancel={onRequestClose}
                onDirtyChange={onDirtyChange}
                isSubmitting={isSubmitting}
            />
        </Modal>
    )
}
