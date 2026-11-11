import { useMemo } from 'react'
import { PageTitle } from '@components/PageTitle'
import { StatusMessage } from '@components/StatusMessage'
import { ConfirmDialog } from '@components/ConfirmDialog'
import { useCategories } from '@features/categories/hooks/useCategories'
import { useCategoryManager } from '@features/categories/hooks/useCategoryManager'
import { sortCategoriesByName } from '@features/categories/utils/categoryName'
import { NewCategoryForm } from '@features/categories/components/NewCategoryForm'
import { CategoryGrid } from '@features/categories/components/CategoryGrid'
import { CategoryEditModal } from '@features/categories/components/CategoryEditModal'
import { ExitPresence } from '@components/ExitPresence'

export function CategoriesPage() {
    const { data: categories, isLoading, isError } = useCategories()
    const sortedCategories = useMemo(
        () => (categories ? sortCategoriesByName(categories) : categories),
        [categories]
    )
    const manager = useCategoryManager()

    return (
        <div>
            <PageTitle>Categories</PageTitle>
            <NewCategoryForm name={manager.newName} onNameChange={manager.setNewName} onSubmit={manager.createFromInput} />

            {/* While the edit modal is open, it shows the error instead. */}
            {manager.error && manager.editingId == null && (
                <StatusMessage tone="error" className="mb-4">
                    {manager.error}
                </StatusMessage>
            )}

            <CategoryGrid
                categories={sortedCategories}
                isLoading={isLoading}
                hasError={isError}
                onStartEdit={manager.startEdit}
                onDelete={manager.requestDelete}
                isDeleting={manager.isDeleting}
            />

            <ExitPresence>
                {manager.editingId != null && (
                    <CategoryEditModal
                        name={manager.editingName}
                        onNameChange={manager.setEditingName}
                        colorKey={manager.editingColorKey}
                        onColorKeyChange={manager.setEditingColorKey}
                        iconKey={manager.editingIconKey}
                        onIconKeyChange={manager.setEditingIconKey}
                        error={manager.error}
                        isSaving={manager.isSaving}
                        onSave={manager.saveEdit}
                        onCancel={manager.cancelEdit}
                    />
                )}
            </ExitPresence>

            <ExitPresence>
                {manager.deleteTarget && (
                    <ConfirmDialog
                        message={`Delete category "${manager.deleteTarget.name}"? This can't be undone.`}
                        confirmLabel="Delete"
                        onConfirm={manager.confirmDelete}
                        onCancel={manager.cancelDelete}
                    />
                )}
            </ExitPresence>
        </div>
    )
}
