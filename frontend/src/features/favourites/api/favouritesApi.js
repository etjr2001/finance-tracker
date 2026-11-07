import { api, unwrap } from '@api/httpClient'

// Newest first.
export function listFavourites() {
    return unwrap(api.get('/favourites'))
}

// payload: { type: "EXPENSE" | "INCOME", amount, note, categoryId }
export function createFavourite(payload) {
    return unwrap(api.post('/favourites', payload))
}

export function updateFavourite(id, payload) {
    return unwrap(api.put(`/favourites/${id}`, payload))
}

export function deleteFavourite(id) {
    return unwrap(api.delete(`/favourites/${id}`))
}
