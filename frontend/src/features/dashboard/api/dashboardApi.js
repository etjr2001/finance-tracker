import { api, unwrap } from '@api/httpClient'

// month: "YYYY-MM", or undefined for the server's current month.
export function getDashboard(month) {
    return unwrap(api.get('/dashboards', { params: month ? { month } : {} }))
}
