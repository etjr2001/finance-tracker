import { NavLink } from 'react-router-dom'

const tabLinkClass =
    'relative flex-1 flex flex-col items-center justify-center min-h-14 py-2 text-xs'

function tabLabelClass(isActive) {
    const stateClass = isActive ? 'text-paper-raised font-medium' : 'text-ink-soft'
    return `relative flex flex-col items-center gap-0.5 transition-colors ${stateClass}`
}

// Below md: fixed bottom tab bar (ADR0010). The bottom padding is the
// safe-area inset or 0.375rem, whichever is larger: index.html has no
// viewport-fit=cover, so iOS reports the inset as 0, and without a floor
// the outer labels sit on the screen's rounded corners and get clipped.
// The matching 0.375rem top padding keeps icon and label vertically
// centred. min-h-14 (not ADR0010's 44px floor) keeps tap targets clear of
// the home-indicator gesture zone.
//
// The active tab's highlight fills its whole cell and stretches through
// the bar's top and bottom padding (pointer-events-none, so the padding
// still isn't tappable). Its view-transition-name makes the page
// transition slide it from the old tab to the new one; each label has its
// own name so it stays painted above the moving highlight. The bar itself
// is named too, so it stays still while the page swaps.
export function BottomTabBar({ navItems }) {
    return (
        <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex bg-paper-raised border-t border-rule pt-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)] [view-transition-name:tabbar]">
            {navItems.map(({ label, to, isEnd, icon: Icon }, index) => (
                <NavLink key={label} to={to} end={isEnd} viewTransition className={tabLinkClass}>
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 bg-deposit pointer-events-none [view-transition-name:tab-indicator]"
                                    style={{ top: '-0.375rem', bottom: 'calc(-1 * max(env(safe-area-inset-bottom), 0.375rem))' }}
                                />
                            )}
                            <span
                                className={tabLabelClass(isActive)}
                                style={{ viewTransitionName: `tab-label-${index}` }}
                            >
                                <Icon aria-hidden="true" strokeWidth={1.7} className="h-5 w-5" />
                                {label}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}
