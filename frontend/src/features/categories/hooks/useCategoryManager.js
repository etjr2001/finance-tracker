import { useState } from 'react'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@features/categories/hooks/useCategories'
import { assignColorKey } from '@features/categories/utils/categorySwatch'
import { guessIconKey } from '@features/categories/utils/categoryIcon'
import { apiErrorMessage } from '@api/httpClient'

// All Categories-page business state: the add form, which category is being
// edited (and its in-progress name/colour/icon), the pending delete
// confirmation, and the shared error line. The page and its components stay
// purely presentational.
export function useCategoryManager() {
    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()
    const deleteCategory = useDeleteCategory()

    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const [editingColorKey, setEditingColorKey] = useState(null)
    const [editingIconKey, setEditingIconKey] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [error, setError] = useState(null)

    async function runWithError(action, fallbackMessage) {
        setError(null)
        try {
            await action()
            return true
        } catch (err) {
            setError(apiErrorMessage(err, fallbackMessage))
            return false
        }
    }

    // Fewest-click creation (docs/backlog.md): no colour/icon step here —
    // colour is auto-assigned from the name and icon is guessed from a
    // keyword match (null if none), both customisable afterwards via edit.
    async function createFromInput() {
        const name = newName.trim()
        if (!name) return
        const isCreated = await runWithError(
            () => createCategory.mutateAsync({ name, colorKey: assignColorKey(name), iconKey: guessIconKey(name) }),
            'Could not create category.'
        )
        if (isCreated) setNewName('')
    }

    function startEdit(category) {
        setError(null)
        setEditingId(category.id)
        setEditingName(category.name)
        setEditingColorKey(category.colorKey)
        setEditingIconKey(category.iconKey)
    }

    function cancelEdit() {
        setEditingId(null)
    }

    async function saveEdit() {
        const name = editingName.trim()
        if (!name) return
        const isSaved = await runWithError(
            () =>
                updateCategory.mutateAsync({
                    id: editingId,
                    name,
                    colorKey: editingColorKey,
                    iconKey: editingIconKey,
                }),
            'Could not update category.'
        )
        if (isSaved) setEditingId(null)
    }

    async function confirmDelete() {
        const { id } = deleteTarget
        setDeleteTarget(null)
        await runWithError(() => deleteCategory.mutateAsync(id), 'Could not delete category.')
    }

    function isDeleting(categoryId) {
        return deleteCategory.isPending && deleteCategory.variables === categoryId
    }

    return {
        error,
        newName,
        setNewName,
        createFromInput,
        editingId,
        editingName,
        setEditingName,
        editingColorKey,
        setEditingColorKey,
        editingIconKey,
        setEditingIconKey,
        startEdit,
        cancelEdit,
        saveEdit,
        isSaving: updateCategory.isPending,
        deleteTarget,
        requestDelete: setDeleteTarget,
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
        isDeleting,
    }
}
