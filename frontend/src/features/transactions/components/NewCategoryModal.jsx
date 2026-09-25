import { Modal } from '@components/Modal'
import { Button } from '@components/Button'
import { AddButton } from '@components/AddButton'
import { FormField } from '@components/FormField'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

// Not a <form>: it renders while TransactionForm's <form> is mounted, and
// Enter must create the category rather than submit the transaction.
export function NewCategoryModal({ name, onNameChange, error, isCreating, onCreate, onCancel }) {
    function handleKeyDown(event) {
        if (event.key !== 'Enter') return
        event.preventDefault()
        onCreate()
    }

    return (
        <Modal onRequestClose={onCancel}>
            <FormField
                label="New category name"
                htmlFor="newCategoryName"
                autoFocus
                type="text"
                maxLength={MAX_CATEGORY_NAME_LENGTH}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Category name"
            />
            {error && <p className="mt-1 text-xs text-withdrawal">{error}</p>}
            <div className="flex gap-4 mt-4">
                <AddButton onClick={onCreate} disabled={isCreating}>
                    Create
                </AddButton>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Modal>
    )
}
