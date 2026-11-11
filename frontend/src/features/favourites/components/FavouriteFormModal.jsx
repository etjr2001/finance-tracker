import { FormModal } from '@components/FormModal'
import { FavouriteForm } from '@features/favourites/components/FavouriteForm'

export function FavouriteFormModal({ favourite, prefill, categories, error, isSubmitting, onSubmit, onRequestClose, onDirtyChange }) {
    return (
        <FormModal error={error} onRequestClose={onRequestClose}>
            <FavouriteForm
                key={favourite?.id ?? 'new'}
                categories={categories}
                initial={favourite}
                prefill={prefill}
                onSubmit={onSubmit}
                onCancel={onRequestClose}
                onDirtyChange={onDirtyChange}
                isSubmitting={isSubmitting}
            />
        </FormModal>
    )
}
