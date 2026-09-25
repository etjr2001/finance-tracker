import { api, unwrap } from '@api/httpClient'

export function listCategories() {
    return unwrap(api.get('/categories'))
}

export function createCategory({ name }) {
    return unwrap(api.post('/categories', { name }))
}

export function updateCategory(id, { name }) {
    return unwrap(api.put(`/categories/${id}`, { name }))
}

export function deleteCategory(id) {
    return unwrap(api.delete(`/categories/${id}`))
}
