import { api } from './client'

export function bootstrapUser() {
    return api.post('/users/bootstrap').then((res) => res.data)
}
