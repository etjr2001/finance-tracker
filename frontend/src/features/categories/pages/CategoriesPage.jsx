import { PageTitle } from '@components/PageTitle'
import { StatusMessage } from '@components/StatusMessage'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useCategoryManager } from '@features/categories/hooks/useCategoryManager'
import { NewCategoryForm } from '@features/categories/components/NewCategoryForm'
import { CategoryGrid } from '@features/categories/components/CategoryGrid'

export function CategoriesPage() {
    const { data: categories, isLoading, isError } = useCategories()
    const manager = useCategoryManager()

    return (
        <div>
            <PageTitle>Categories</PageTitle>
            <NewCategoryForm name={manager.newName} onNameChange={manager.setNewName} onSubmit={manager.createFromInput} />

            {manager.error && (
                <StatusMessage tone="error" className="mb-4">
                    {manager.error}
                </StatusMessage>
            )}

            <CategoryGrid
                categories={categories}
                isLoading={isLoading}
                hasError={isError}
                editingId={manager.editingId}
                editingName={manager.editingName}
                onEditingNameChange={manager.setEditingName}
                onStartEdit={manager.startEdit}
                onSaveEdit={manager.saveEdit}
                onCancelEdit={manager.cancelEdit}
                onDelete={manager.requestDelete}
                isDeleting={manager.isDeleting}
            />

            {manager.deleteTarget && (
                <ConfirmDialog
                    message={`Delete category "${manager.deleteTarget.name}"? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={manager.confirmDelete}
                    onCancel={manager.cancelDelete}
                />
            )}
        </div>
    )
}
