// Shared button styling per ADR0010: deposit for primary actions,
// withdrawal for destructive ones, ghost for secondary/cancel actions.
// min-h-11 (44px) clears the mobile touch-target minimum.
const VARIANTS = {
    primary: 'bg-deposit text-paper hover:opacity-90 disabled:opacity-50',
    danger: 'bg-withdrawal text-paper hover:opacity-90 disabled:opacity-50',
    ghost: 'text-ink-soft hover:text-ink disabled:opacity-50',
    // De-emphasized destructive action (text-only red) for a *first*
    // destructive trigger beside a dominant primary action. `danger`
    // (solid) stays reserved for the actual confirmation step.
    dangerGhost: 'text-withdrawal hover:opacity-70 disabled:opacity-50',
}

const TEXT_ONLY_VARIANTS = new Set(['ghost', 'dangerGhost'])

const BASE_CLASS = 'inline-flex items-center justify-center min-h-11 rounded-xl text-sm transition-opacity'

// Thin wrapper over the native <button>; remaining props (onClick,
// disabled, aria-*) are forwarded by design.
export function Button({ variant = 'primary', isFullWidth = false, className = '', type = 'button', ...buttonProps }) {
    const sizingClass = TEXT_ONLY_VARIANTS.has(variant) ? 'px-2' : 'px-4 py-2'
    const widthClass = isFullWidth ? 'w-full' : ''

    return (
        <button
            type={type}
            className={`${BASE_CLASS} ${sizingClass} ${widthClass} ${VARIANTS[variant]} ${className}`}
            {...buttonProps}
        />
    )
}
