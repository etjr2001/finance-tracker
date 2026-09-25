// Square 44px icon-only button (edit, delete, close, prev/next…). The
// accessible name comes from `label`, since there is no visible text.
const TONES = {
    neutral: 'text-ink-soft hover:text-ink',
    danger: 'text-ink-soft hover:text-withdrawal',
}

export function IconButton({ icon: Icon, label, onClick, isDisabled = false, tone = 'neutral', iconSize = 'h-4 w-4', className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            aria-label={label}
            className={`h-11 w-11 shrink-0 flex items-center justify-center rounded-sm disabled:opacity-50 disabled:pointer-events-none ${TONES[tone]} ${className}`}
        >
            <Icon aria-hidden="true" strokeWidth={1.7} className={iconSize} />
        </button>
    )
}
