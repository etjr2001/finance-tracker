import { api, unwrap } from '@api/httpClient'

export function listCategories() {
    return unwrap(api.get('/categories'))
}

export function createCategory({ name, colorKey = null, iconKey = null }) {
    return unwrap(api.post('/categories', { name, colorKey, iconKey }))
}

export function updateCategory(id, { name, colorKey = null, iconKey = null }) {
    return unwrap(api.put(`/categories/${id}`, { name, colorKey, iconKey }))
}

export function deleteCategory(id) {
    return unwrap(api.delete(`/categories/${id}`))
}
