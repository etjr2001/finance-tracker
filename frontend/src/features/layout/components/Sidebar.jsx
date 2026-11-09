import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'

function sidebarLinkClass({ isActive }) {
    const stateClass = isActive
        ? 'text-paper-raised font-medium'
        : 'text-ink-soft hover:text-ink hover:bg-rule-soft'
    return `relative flex items-center px-3 py-1.5 rounded-sm text-sm transition-colors ${stateClass}`
}

// md:+ sidebar. sticky + h-screen pins it to the viewport so only <main>
// scrolls — otherwise it scrolls away on pages taller than one screen.
// Its own view-transition-name keeps it still while the page crossfades.
// The active link's highlight is a separate named element, so the page
// transition slides it from the old link to the new one; each label is
// named too, so it stays painted above the moving highlight.
export function Sidebar({ navItems, exitLabel, onExit }) {
    return (
        <aside className="hidden md:flex md:w-52 shrink-0 md:border-r border-rule flex-col md:justify-between md:sticky md:top-0 md:h-screen md:overflow-y-auto [view-transition-name:sidebar]">
            <div className="p-6">
                <h1 className="font-serif font-semibold text-xl mb-8">Ledger</h1>
                <nav className="flex flex-col gap-1 -ml-3">
                    {navItems.map(({ label, to, isEnd, icon: Icon }, index) => (
                        <NavLink key={label} to={to} end={isEnd} viewTransition className={sidebarLinkClass}>
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 rounded-sm bg-deposit pointer-events-none [view-transition-name:sidebar-indicator]"
                                        />
                                    )}
                                    <span
                                        className="relative flex items-center gap-2"
                                        style={{ viewTransitionName: `sidebar-label-${index}` }}
                                    >
                                        <Icon aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="p-6">
                <button
                    onClick={onExit}
                    className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
                >
                    <LogOut aria-hidden="true" strokeWidth={1.7} className="h-4 w-4" />
                    {exitLabel}
                </button>
            </div>
        </aside>
    )
}
