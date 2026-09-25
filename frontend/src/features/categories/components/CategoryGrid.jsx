import { Card } from '@components/Card'
import { StatusMessage } from '@components/StatusMessage'
import { CategoryRow } from '@features/categories/components/CategoryRow'
import { CategoryEditRow } from '@features/categories/components/CategoryEditRow'

export function CategoryGrid({
    categories,
    isLoading,
    hasError,
    editingId,
    editingName,
    onEditingNameChange,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    isDeleting,
}) {
    if (isLoading) return <StatusMessage>Loading categories…</StatusMessage>
    if (hasError) return <StatusMessage tone="error">Could not load categories.</StatusMessage>
    if (!categories?.length) return <StatusMessage>No categories yet.</StatusMessage>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categories.map((category) => (
                <Card key={category.id} className="p-3 flex items-center gap-3">
                    {editingId === category.id ? (
                        <CategoryEditRow
                            name={editingName}
                            onNameChange={onEditingNameChange}
                            onSave={onSaveEdit}
                            onCancel={onCancelEdit}
                        />
                    ) : (
                        <CategoryRow
                            category={category}
                            isDeleting={isDeleting(category.id)}
                            onEdit={onStartEdit}
                            onDelete={onDelete}
                        />
                    )}
                </Card>
            ))}
        </div>
    )
}
