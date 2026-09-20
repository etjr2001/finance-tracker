import { useState } from 'react'
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../hooks/useCategories'
import { apiErrorMessage } from '../api/client'

export default function CategoriesPage() {
    const { data: categories, isLoading, isError } = useCategories()
    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()
    const deleteCategory = useDeleteCategory()

    const [newName, setNewName] = useState('')
    const [error, setError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    async function handleCreate(e) {
        e.preventDefault()
        if (!newName.trim()) return
        setError(null)
        try {
            await createCategory.mutateAsync({ name: newName.trim() })
            setNewName('')
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not create category.'))
        }
    }

    function startEdit(category) {
        setError(null)
        setEditingId(category.id)
        setEditingName(category.name)
    }

    async function handleSaveEdit(id) {
        if (!editingName.trim()) return
        setError(null)
        try {
            await updateCategory.mutateAsync({ id, name: editingName.trim() })
            setEditingId(null)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not update category.'))
        }
    }

    async function handleDelete(id, name) {
        if (!window.confirm(`Delete category "${name}"? This can't be undone.`)) return
        setError(null)
        try {
            await deleteCategory.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete category.'))
        }
    }

    const inputClass =
        'border border-rule bg-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ink'

    return (
        <div>
            <h2 className="font-serif text-2xl mb-6">Categories</h2>

            <form onSubmit={handleCreate} className="flex gap-2 mb-8 max-w-sm">
                <input
                    type="text"
                    placeholder="New category name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`flex-1 ${inputClass}`}
                />
                <button
                    type="submit"
                    className="bg-ink text-paper px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity"
                >
                    Add
                </button>
            </form>

            {error && <p className="text-withdrawal text-sm mb-4">{error}</p>}

            {isLoading && <p className="text-ink-soft text-sm">Loading categories…</p>}
            {isError && <p className="text-withdrawal text-sm">Could not load categories.</p>}

            {categories && categories.length === 0 && (
                <p className="text-ink-soft text-sm">No categories yet.</p>
            )}

            <ul className="max-w-sm divide-y divide-rule border-t border-b border-rule">
                {categories?.map((category) => (
                    <li key={category.id} className="flex items-center gap-3 py-2.5">
                        {editingId === category.id ? (
                            <>
                                <input
                                    autoFocus
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className={`flex-1 ${inputClass}`}
                                />
                                <button onClick={() => handleSaveEdit(category.id)} className="text-sm text-ink hover:opacity-70">
                                    Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-sm text-ink-soft hover:text-ink">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1">{category.name}</span>
                                <button onClick={() => startEdit(category)} className="text-sm text-ink-soft hover:text-ink">
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id, category.name)}
                                    disabled={deleteCategory.isPending && deleteCategory.variables === category.id}
                                    className="text-sm text-ink-soft hover:text-withdrawal disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}