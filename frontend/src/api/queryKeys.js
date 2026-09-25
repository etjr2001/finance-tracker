// Single source of truth for React Query keys. Every key is scoped by
// `isDemo` so demo (localStorage) and real (network) data never share a
// cache entry (ADR0009).
export const queryKeys = {
    categories: (isDemo) => ['categories', isDemo],
    transactions: (isDemo) => ['transactions', isDemo],
    dashboard: (isDemo) => ['dashboard', isDemo],
    dashboardForMonth: (isDemo, month) => ['dashboard', isDemo, month],
}
