import { api } from './client'

// month: "YYYY-MM" or undefined for current month
export function getDashboard(month) {
    return api
        .get('/dashboards', { params: month ? { month } : {} })
        .then((res) => res.data)
}
