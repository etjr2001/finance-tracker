import { AddButton } from '@components/AddButton'
import { inputClass } from '@components/formStyles'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

// Full-width row with a responsive input (matching a form field's
// proportions, not a fixed small box) and Add pinned far right, so it
// lines up exactly with the Transactions page's MonthBar + Add row.
export function NewCategoryForm({ name, onNameChange, onSubmit }) {
    function handleSubmit(event) {
        event.preventDefault()
        onSubmit()
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-start justify-between gap-3 mb-6">
            <div className="flex-1 max-w-xs">
                <input
                    type="text"
                    placeholder="New category name"
                    maxLength={MAX_CATEGORY_NAME_LENGTH}
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    className={inputClass}
                />
                <p className="mt-1 text-xs text-ink-soft tabular">
                    {name.length}/{MAX_CATEGORY_NAME_LENGTH}
                </p>
            </div>
            <AddButton type="submit" />
        </form>
    )
}
