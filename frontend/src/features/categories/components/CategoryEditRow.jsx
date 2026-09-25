import { inputClass } from '@components/formStyles'
import { MAX_CATEGORY_NAME_LENGTH } from '@features/categories/utils/categoryName'

export function CategoryEditRow({ name, onNameChange, onSave, onCancel }) {
    return (
        <>
            <input
                autoFocus
                maxLength={MAX_CATEGORY_NAME_LENGTH}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className={`flex-1 min-w-0 ${inputClass}`}
            />
            <button onClick={onSave} className="text-sm text-ink hover:opacity-70 shrink-0">
                Save
            </button>
            <button onClick={onCancel} className="text-sm text-ink-soft hover:text-ink shrink-0">
                Cancel
            </button>
        </>
    )
}
