import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDemoMode } from '../demo/DemoModeContext'
import DemoBanner from '../demo/DemoBanner'

const navItems = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/transactions', label: 'Transactions' },
    { to: '/categories', label: 'Categories' },
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
            <div className="flex flex-1 flex-col md:flex-row">
                <aside className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-rule flex flex-col md:justify-between">
                    <div className="p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h1 className="font-serif font-semibold text-xl">Ledger</h1>
                            <button
                                onClick={handleExit}
                                className="md:hidden shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors border border-rule rounded-sm px-3 py-1.5"
                            >
                                <LogOut aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                {isDemo ? 'Exit demo' : 'Log out'}
                            </button>
                        </div>
                        <nav className="mt-8 flex md:flex-col flex-wrap gap-1 -ml-3">
                            {items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `px-3 py-1.5 rounded-sm text-sm transition-colors ${
                                            isActive
                                                ? 'text-deposit font-medium'
                                                : 'text-ink-soft hover:text-ink'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    <div className="hidden md:block p-6">
                        <button
                            onClick={handleExit}
                            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
                        >
                            <LogOut aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                            {isDemo ? 'Exit demo' : 'Log out'}
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-6 md:p-10 max-w-3xl">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
