import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/transactions', label: 'Transactions' },
    { to: '/categories', label: 'Categories' },
]

export default function Layout() {
    const { logout } = useAuth()

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <aside className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-rule flex md:flex-col justify-between">
                <div className="p-6">
                    <h1 className="font-serif text-xl">Ledger</h1>
                    <nav className="mt-8 flex md:flex-col gap-1 -ml-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-sm text-sm transition-colors ${
                                        isActive
                                            ? 'bg-paper-raised text-ink font-medium'
                                            : 'text-ink-soft hover:text-ink'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    <button
                        onClick={logout}
                        className="text-sm text-ink-soft hover:text-ink transition-colors"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 max-w-3xl">
                <Outlet />
            </main>
        </div>
    )
}
