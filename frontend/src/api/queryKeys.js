// Single source of truth for React Query keys. Every key is scoped by
// `isDemo` so demo (localStorage) and real (network) data never share a
// cache entry (ADR0009).
export const queryKeys = {
    categories: (isDemo) => ['categories', isDemo],
    // Both keys below sit under transactions(isDemo), so invalidating that
    // prefix refreshes every month and the Drafts list at once.
    transactions: (isDemo) => ['transactions', isDemo],
    transactionsForMonth: (isDemo, month) => ['transactions', isDemo, 'month', month],
    drafts: (isDemo) => ['transactions', isDemo, 'drafts'],
    dashboard: (isDemo) => ['dashboard', isDemo],
    dashboardForMonth: (isDemo, month) => ['dashboard', isDemo, month],
}
