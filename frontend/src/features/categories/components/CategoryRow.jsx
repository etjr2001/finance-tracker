import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@components/IconButton'
import { CategoryTile } from '@features/categories/components/CategoryTile'

export function CategoryRow({ category, isDeleting, onEdit, onDelete }) {
    return (
        <>
            <CategoryTile categoryId={category.id} categoryName={category.name} />
            <span className="flex-1 min-w-0 truncate">{category.name}</span>
            <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(category)} />
            <IconButton
                icon={Trash2}
                label="Delete"
                tone="danger"
                isDisabled={isDeleting}
                onClick={() => onDelete(category)}
            />
        </>
    )
}
