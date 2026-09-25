import { ChevronDown } from 'lucide-react'
import { inputClass, nativeSelectResetClass } from '@components/formStyles'

const NEW_CATEGORY_VALUE = '__new__'

export function CategorySelect({ categories, value, onChange, onRequestNew }) {
    function handleChange(event) {
        const selected = event.target.value
        if (selected === NEW_CATEGORY_VALUE) {
            onRequestNew()
            return
        }
        onChange(selected)
    }

    return (
        <div>
            <label className="block text-sm text-ink-soft mb-1" htmlFor="categoryId">
                Category
            </label>
            <div className="relative">
                <select
                    id="categoryId"
                    required
                    value={value}
                    onChange={handleChange}
                    className={`${inputClass} ${nativeSelectResetClass} pr-8`}
                >
                    <option value="" disabled>
                        Select one
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                    <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
                </select>
                <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.7}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
                />
            </div>
        </div>
    )
}
