// Square 44px icon-only button (edit, delete, close, prev/next…). The
// accessible name comes from `label`, since there is no visible text.
// `hasTooltip` also shows the label on hover, for an icon whose meaning
// isn't obvious (e.g. a star that saves rather than marks a favourite).
// `isIconFilled` fills the icon's shape (e.g. a filled star for "already a
// favourite"); pair it with the `accent` tone.
const TONES = {
    neutral: 'text-ink-soft hover:text-ink',
    danger: 'text-ink-soft hover:text-withdrawal',
    accent: 'text-deposit hover:opacity-80',
}

export function IconButton({
    icon: Icon,
    label,
    onClick,
    isDisabled = false,
    hasTooltip = false,
    isIconFilled = false,
    tone = 'neutral',
    iconSize = 'h-4 w-4',
    className = '',
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            aria-label={label}
            title={hasTooltip ? label : undefined}
            className={`h-11 w-11 shrink-0 flex items-center justify-center rounded-sm disabled:opacity-50 disabled:pointer-events-none ${TONES[tone]} ${className}`}
        >
            <Icon
                aria-hidden="true"
                strokeWidth={1.7}
                fill={isIconFilled ? 'currentColor' : 'none'}
                className={iconSize}
            />
        </button>
    )
}
