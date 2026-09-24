import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../hooks/useCategories'
import ConfirmDialog from '../components/ConfirmDialog'
import AddButton from '../components/AddButton'
import Card from '../components/Card'
import { inputClass } from '../components/FormField'
import { categoryTileClasses } from '../lib/categorySwatch'
import { categoryIcon } from '../lib/categoryIcon'
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
    const [deleteTarget, setDeleteTarget] = useState(null)

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

    function requestDelete(category) {
        setDeleteTarget(category)
    }

    async function confirmDelete() {
        const { id } = deleteTarget
        setDeleteTarget(null)
        setError(null)
        try {
            await deleteCategory.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete category.'))
        }
    }

    return (
        <div>
            <h2 className="font-serif font-semibold text-2xl mb-6">Categories</h2>

            <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-md">
                <input
                    type="text"
                    placeholder="New category name"
                    maxLength={50}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`flex-1 ${inputClass}`}
                />
                <AddButton type="submit" />
            </form>

            {error && <p className="text-withdrawal text-sm mb-4">{error}</p>}

            {isLoading && <p className="text-ink-soft text-sm">Loading categories…</p>}
            {isError && <p className="text-withdrawal text-sm">Could not load categories.</p>}

            {categories && categories.length === 0 && (
                <p className="text-ink-soft text-sm">No categories yet.</p>
            )}

            {categories && categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categories.map((category) => {
                        const Icon = categoryIcon(category.name)
                        return (
                            <Card key={category.id} className="p-3 flex items-center gap-3">
                                {editingId === category.id ? (
                                    <>
                                        <input
                                            autoFocus
                                            maxLength={50}
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className={`flex-1 min-w-0 ${inputClass}`}
                                        />
                                        <button onClick={() => handleSaveEdit(category.id)} className="text-sm text-ink hover:opacity-70 shrink-0">
                                            Save
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-sm text-ink-soft hover:text-ink shrink-0">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Deterministic tile colour (ADR0010) + an icon
                                            guessed from the category's name, both stopgaps
                                            until real Category colour/icon exists (Sprint 3,
                                            docs/backlog.md). */}
                                        <div
                                            className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${categoryTileClasses(category.id)}`}
                                        >
                                            <Icon aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 min-w-0 truncate">{category.name}</span>
                                        <button
                                            onClick={() => startEdit(category)}
                                            aria-label="Edit"
                                            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-sm text-ink-soft hover:text-ink"
                                        >
                                            <Pencil aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => requestDelete(category)}
                                            disabled={deleteCategory.isPending && deleteCategory.variables === category.id}
                                            aria-label="Delete"
                                            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-sm text-ink-soft hover:text-withdrawal disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            <Trash2 aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Delete category "${deleteTarget.name}"? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}
