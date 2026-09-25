import { useMemo, useState } from 'react'
import { useCreateCategory } from '@features/categories/hooks/useCategories'
import { findCategoryByName, sortCategoriesByName } from '@features/categories/utils/categoryName'
import { apiErrorMessage } from '@api/httpClient'

// "+ Add new category…" from inside TransactionForm. `onSelect` receives
// the chosen category id (as a string, matching the <select> value).
export function useInlineCategoryCreate({ categories, onSelect }) {
    const createCategory = useCreateCategory()
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [error, setError] = useState(null)
    // The just-created category, shown locally until the parent's
    // categories query refetches and includes it — so the <select> has a
    // matching option to display as selected in the meantime.
    const [pendingCategory, setPendingCategory] = useState(null)

    const sortedCategories = useMemo(() => {
        const list = categories ?? []
        const hasPending = pendingCategory && list.some((category) => category.id === pendingCategory.id)
        return sortCategoriesByName(pendingCategory && !hasPending ? [...list, pendingCategory] : list)
    }, [categories, pendingCategory])

    function open() {
        setIsOpen(true)
        setName('')
        setError(null)
    }

    function close() {
        setIsOpen(false)
        setName('')
        setError(null)
    }

    function selectAndClose(categoryId) {
        onSelect(String(categoryId))
        setIsOpen(false)
    }

    async function create() {
        const trimmed = name.trim()
        if (!trimmed) return
        setError(null)

        // Reuse instead of creating a case-insensitive near-duplicate.
        const existing = findCategoryByName(sortedCategories, trimmed)
        if (existing) {
            selectAndClose(existing.id)
            return
        }

        try {
            const created = await createCategory.mutateAsync({ name: trimmed })
            setPendingCategory(created)
            selectAndClose(created.id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not create category.'))
        }
    }

    return {
        sortedCategories,
        isOpen,
        name,
        setName,
        error,
        isCreating: createCategory.isPending,
        open,
        close,
        create,
    }
}
