// Wraps data that may be the previous month's while the next one loads
// (React Query's keepPreviousData). While `isStale`, it's dimmed and
// aria-busy so it never passes for the new month's data. An opacity fade
// only, so it stays under Reduce Motion (fades stay, movement goes).
export function StaleContent({ isStale, className = '', children }) {
    return (
        <div
            aria-busy={isStale}
            className={`transition-opacity duration-200 ${isStale ? 'opacity-50' : ''} ${className}`}
        >
            {children}
        </div>
    )
}
