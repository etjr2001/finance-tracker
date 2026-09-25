import { api, unwrap } from '@api/httpClient'

export function bootstrapUser() {
    return unwrap(api.post('/users/bootstrap'))
}
