import { LayoutDashboard, Receipt, Tags } from 'lucide-react'

// isMonthScoped: Dashboard and Transactions show the selected month;
// Categories doesn't and never carries ?month= (ADR0011).
export const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', isEnd: true, icon: LayoutDashboard, isMonthScoped: true },
    { to: '/transactions', label: 'Transactions', icon: Receipt, isMonthScoped: true },
    { to: '/categories', label: 'Categories', icon: Tags },
]

// Demo routes live under /demo; without the prefix "Transactions" would hit
// the real protected route and bounce back to /demo.
export function toDemoPath(path) {
    return `/demo${path === '/' ? '' : path}`
}

export function resolveNavItems({ isDemo, carriedMonth }) {
    return NAV_ITEMS.map((item) => {
        const pathname = isDemo ? toDemoPath(item.to) : item.to
        // ADR0011: nav links preserve ?month= — only while one is known;
        // otherwise the destination falls back to the current month.
        const to = item.isMonthScoped && carriedMonth ? { pathname, search: `?month=${carriedMonth}` } : pathname
        return { ...item, to }
    })
}
