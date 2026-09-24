import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { LogOut, LayoutDashboard, Receipt, Tags } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDemoMode } from '../demo/DemoModeContext'
import DemoBanner from '../demo/DemoBanner'

// monthScoped: Dashboard and Transactions show the selected month;
// Categories doesn't and never carries ?month= (ADR0011).
const navItems = [
    { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard, monthScoped: true },
    { to: '/transactions', label: 'Transactions', icon: Receipt, monthScoped: true },
    { to: '/categories', label: 'Categories', icon: Tags },
]

export default function Layout() {
    // Safe to call unconditionally: AuthProvider wraps the whole app in
    // main.jsx, including the /demo subtree, so this context always exists —
    // logout() just isn't invoked while in demo mode.
    const { logout } = useAuth()
    const isDemo = useDemoMode()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const monthParam = searchParams.get('month')

    // Categories legitimately has no ?month= (ADR0011), so monthParam is
    // null while there — but Layout itself doesn't unmount between routes
    // (every page renders through the same <Outlet/>), so remembering the
    // last real value here survives that detour. Without this, Dashboard
    // -> Categories -> Transactions would drop the selected month, since
    // Categories has nothing of its own to pass forward.
    //
    // Updated during render (React's documented pattern for "adjust state
    // when a prop changes"), not in a useEffect — an effect here would
    // commit once without the new value, then re-render, for no benefit
    // since nothing needs to run outside React itself.
    const [lastMonth, setLastMonth] = useState(monthParam)
    const [prevMonthParam, setPrevMonthParam] = useState(monthParam)
    if (monthParam !== prevMonthParam) {
        setPrevMonthParam(monthParam)
        if (monthParam) setLastMonth(monthParam)
    }
    const monthToCarry = monthParam ?? lastMonth

    // Demo routes live under /demo, so nav links need that prefix there —
    // otherwise "Transactions" would hit the real protected /transactions
    // route and get bounced back to /demo by ProtectedRoute.
    const items = (isDemo
        ? navItems.map((item) => ({ ...item, to: `/demo${item.to === '/' ? '' : item.to}` }))
        : navItems
    ).map((item) =>
        // Carries the current month across pages (ADR0011: "Navigation
        // links preserve the parameter") — only while one is known;
        // otherwise the destination just falls back to its own default
        // (the current month) via useSelectedMonth.
        item.monthScoped && monthToCarry
            ? { ...item, to: { pathname: item.to, search: `?month=${monthToCarry}` } }
            : item
    )

    const exitLabel = isDemo ? 'Exit demo' : 'Log out'

    function handleExit() {
        if (isDemo) {
            navigate('/login')
        } else {
            logout()
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {isDemo && <DemoBanner />}

            {/* Compact mobile header: below md:, nav lives in the bottom tab
                bar instead, so this is just the title and an icon-only
                Log out/Exit demo button (ADR0010). */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-rule bg-paper-raised">
                <h1 className="font-serif font-semibold text-xl">Ledger</h1>
                <button
                    onClick={handleExit}
                    aria-label={exitLabel}
                    className="inline-flex items-center justify-center h-11 w-11 -mr-2 rounded-sm text-ink-soft hover:text-ink transition-colors"
                >
                    <LogOut aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                </button>
            </div>

            {/* Sidebar + content centred as one shell on wide screens, not
                just the content beside a left-pinned sidebar — otherwise a
                wide monitor piles all the empty space on the right. */}
            <div className="flex flex-1 flex-col md:flex-row md:max-w-[1400px] md:mx-auto md:w-full">
                {/* md: and up: sidebar with icon nav and Log out at its foot. */}
                {/* sticky + h-screen: pins the sidebar to the viewport so
                    only <main> scrolls. Without this it just flows with
                    the page, so on a page short enough to fit one screen
                    (Dashboard, Categories) it looks "fixed" by accident,
                    then visibly scrolls away on a page tall enough to
                    actually need scrolling (Transactions). */}
                <aside className="hidden md:flex md:w-52 shrink-0 md:border-r border-rule flex-col md:justify-between md:sticky md:top-0 md:h-screen md:overflow-y-auto">
                    <div className="p-6">
                        <h1 className="font-serif font-semibold text-xl mb-8">Ledger</h1>
                        <nav className="flex flex-col gap-1 -ml-3">
                            {items.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm transition-colors ${
                                            isActive
                                                ? 'text-deposit font-medium'
                                                : 'text-ink-soft hover:text-ink'
                                        }`
                                    }
                                >
                                    <item.icon aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    <div className="p-6">
                        <button
                            onClick={handleExit}
                            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
                        >
                            <LogOut aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                            {exitLabel}
                        </button>
                    </div>
                </aside>

                {/* Content fills the main area up to 1100px, centred, rather
                    than a narrow left-aligned column (ADR0010). Bottom
                    padding on mobile clears the fixed tab bar. */}
                <main className="flex-1 min-w-0 p-6 pb-24 md:p-10">
                    <div className="max-w-[1100px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Below md:, a fixed bottom tab bar replaces the top nav
                (ADR0010). pb-[env(...)] clears the home-indicator area on
                iPhones without a physical home button. */}
            {/* min-h-14 (56px), not the bare min-h-11 (44px) ADR0010 sets as
                a floor elsewhere: pb-safe-area above only clears the
                background past the home-indicator gesture area, not the
                tap targets themselves, so on an iPhone without a home
                button the 44px zone still sat close enough to the edge to
                make bottom-row taps imprecise (docs/backlog.md). */}
            <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex bg-paper-raised border-t border-rule pb-[env(safe-area-inset-bottom)]">
                {items.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-xs transition-colors ${
                                isActive ? 'text-deposit font-medium' : 'text-ink-soft'
                            }`
                        }
                    >
                        <item.icon aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}
