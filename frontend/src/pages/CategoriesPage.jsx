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

    async function handleDelete(id) {
        setError(null)
        try {
            await deleteCategory.mutateAsync(id)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not delete category.'))
        }
    }

    if (isLoading) return <div style={{ padding: 20 }}>Loading categories…</div>
    if (isError) return <div style={{ padding: 20 }}>Could not load categories.</div>

    return (
        <div style={{ padding: 20, maxWidth: 400 }}>
            <h1>Categories</h1>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="New category name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button type="submit">Add</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {categories.map((category) => (
                    <li key={category.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #ddd' }}>
                        {editingId === category.id ? (
                            <>
                                <input
                                    autoFocus
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={() => handleSaveEdit(category.id)}>Save</button>
                                <button onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span style={{ flex: 1 }}>{category.name}</span>
                                <button onClick={() => startEdit(category)}>Edit</button>
                                <button onClick={() => handleDelete(category.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}