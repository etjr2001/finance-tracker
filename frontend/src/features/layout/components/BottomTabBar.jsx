import { NavLink } from 'react-router-dom'

function tabLinkClass({ isActive }) {
    const stateClass = isActive ? 'text-deposit font-medium' : 'text-ink-soft'
    return `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-xs transition-colors ${stateClass}`
}

// Below md: fixed bottom tab bar (ADR0010). The safe-area padding clears
// the iPhone home indicator; min-h-14 (not ADR0010's 44px floor) keeps tap
// targets far enough from that gesture zone to stay precise.
export function BottomTabBar({ navItems }) {
    return (
        <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex bg-paper-raised border-t border-rule pb-[env(safe-area-inset-bottom)]">
            {navItems.map(({ label, to, isEnd, icon: Icon }) => (
                <NavLink key={label} to={to} end={isEnd} className={tabLinkClass}>
                    <Icon aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}
