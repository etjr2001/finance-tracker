// Small status pill, styled like the existing Draft badge
// (TransactionsPage): a tint fill, a matching soft border, and text in the
// -ink text variant for contrast (ADR0010: brass is fills/borders only).
// Tones are written out in full so Tailwind's build can find the classes —
// a template string built from `tone` at runtime would not be found.
const TONES = {
    brass: 'text-brass-ink bg-brass/10 border-brass/30',
    deposit: 'text-deposit bg-deposit/10 border-deposit/30',
    withdrawal: 'text-withdrawal bg-withdrawal/10 border-withdrawal/30',
}

export function Badge({ tone = 'brass', className = '', children }) {
    return (
        <span
            className={`text-xs font-medium rounded-full border px-2 py-0.5 shrink-0 ${TONES[tone]} ${className}`}
        >
            {children}
        </span>
    )
}
