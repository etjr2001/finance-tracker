// Shared button styling per ADR0010: deposit for primary actions,
// withdrawal for destructive ones, ghost for secondary/cancel actions.
// 12px radius (controls), min-h-11 (44px) to clear the mobile touch-target
// minimum regardless of font size or padding.
const VARIANTS = {
    primary: 'bg-deposit text-paper hover:opacity-90 disabled:opacity-50',
    danger: 'bg-withdrawal text-paper hover:opacity-90 disabled:opacity-50',
    ghost: 'text-ink-soft hover:text-ink disabled:opacity-50',
    // A de-emphasized destructive action: text-only, red, but not the
    // solid block `danger` is. For a first destructive trigger next to a
    // dominant primary action (e.g. Edit/Delete on a detail card), so the
    // two don't read as equally-weighted competing actions and an
    // accidental tap is less likely. `danger` (solid) stays reserved for
    // an actual confirmation step, where being decisive is the point.
    dangerGhost: 'text-withdrawal hover:opacity-70 disabled:opacity-50',
}

export default function Button({
    variant = 'primary',
    fullWidth = false,
    className = '',
    type = 'button',
    ...props
}) {
    const base =
        'inline-flex items-center justify-center min-h-11 rounded-xl text-sm transition-opacity'
    const sizing = variant === 'ghost' || variant === 'dangerGhost' ? 'px-2' : 'px-4 py-2'
    const width = fullWidth ? 'w-full' : ''

    return (
        <button
            type={type}
            className={`${base} ${sizing} ${width} ${VARIANTS[variant]} ${className}`}
            {...props}
        />
    )
}
