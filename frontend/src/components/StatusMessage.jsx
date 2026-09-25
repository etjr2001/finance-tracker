// Inline loading / empty / error text, so every page uses the same tones.
const TONES = {
    muted: 'text-ink-soft',
    error: 'text-withdrawal',
}

export function StatusMessage({ tone = 'muted', className = '', children }) {
    return <p className={`text-sm ${TONES[tone]} ${className}`}>{children}</p>
}
