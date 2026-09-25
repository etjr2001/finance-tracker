import { AddButton } from '@components/AddButton'
import { inputClass } from '@components/formStyles'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

// Full-width row with a fixed-width input and Add pinned far right, so it
// lines up exactly with the Transactions page's MonthBar + Add row.
export function NewCategoryForm({ name, onNameChange, onSubmit }) {
    function handleSubmit(event) {
        event.preventDefault()
        onSubmit()
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center justify-between gap-3 mb-6">
            <div className="w-56">
                <input
                    type="text"
                    placeholder="New category name"
                    maxLength={MAX_CATEGORY_NAME_LENGTH}
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    className={inputClass}
                />
            </div>
            <AddButton type="submit" />
        </form>
    )
}
