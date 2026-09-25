import { useState } from 'react'
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@features/categories/hooks/useCategories'
import { apiErrorMessage } from '@api/httpClient'

// All Categories-page business state: the add form, which row is being
// renamed, the pending delete confirmation, and the shared error line.
// The page and its components stay purely presentational.
export function useCategoryManager() {
    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()
    const deleteCategory = useDeleteCategory()

    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')
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

    async function createFromInput() {
        const name = newName.trim()
        if (!name) return
        const isCreated = await runWithError(() => createCategory.mutateAsync({ name }), 'Could not create category.')
        if (isCreated) setNewName('')
    }

    function startEdit(category) {
        setError(null)
        setEditingId(category.id)
        setEditingName(category.name)
    }

    function cancelEdit() {
        setEditingId(null)
    }

    async function saveEdit() {
        const name = editingName.trim()
        if (!name) return
        const isSaved = await runWithError(
            () => updateCategory.mutateAsync({ id: editingId, name }),
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
        startEdit,
        cancelEdit,
        saveEdit,
        deleteTarget,
        requestDelete: setDeleteTarget,
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
        isDeleting,
    }
}
