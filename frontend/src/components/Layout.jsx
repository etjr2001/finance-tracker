import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, ArrowLeftRight, Tags } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDemoMode } from '../demo/DemoModeContext'
import DemoBanner from '../demo/DemoBanner'

const navItems = [
    { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/categories', label: 'Categories', icon: Tags },
]

export default function Layout() {
    // Safe to call unconditionally: AuthProvider wraps the whole app in
    // main.jsx, including the /demo subtree, so this context always exists —
    // logout() just isn't invoked while in demo mode.
    const { logout } = useAuth()
    const isDemo = useDemoMode()
    const navigate = useNavigate()

    // Demo routes live under /demo, so nav links need that prefix there —
    // otherwise "Transactions" would hit the real protected /transactions
    // route and get bounced back to /demo by ProtectedRoute.
    const items = isDemo
        ? navItems.map((item) => ({ ...item, to: `/demo${item.to === '/' ? '' : item.to}` }))
        : navItems

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

            <div className="flex flex-1 flex-col md:flex-row">
                {/* md: and up: sidebar with icon nav and Log out at its foot. */}
                <aside className="hidden md:flex md:w-52 shrink-0 md:border-r border-rule flex-col md:justify-between">
                    <div className="p-6">
                        <h1 className="font-serif font-semibold text-xl mb-8">Ledger</h1>
                        <nav className="flex flex-col gap-1 -ml-3">
                            {items.map((item) => (
                                <NavLink
                                    key={item.to}
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
            <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex bg-paper-raised border-t border-rule pb-[env(safe-area-inset-bottom)]">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-11 py-1.5 text-xs transition-colors ${
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
