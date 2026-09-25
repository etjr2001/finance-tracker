import { inputClass } from '@components/formStyles'

// Label + control wrapper. Renders its own <input> by default; pass
// `children` to supply a different control (e.g. a <select>). Remaining
// props are forwarded to the <input> — this is a thin native-element
// wrapper, so forwarding (type, value, onChange, required…) is the point.
// A maxLength prop also renders a live "N/max" counter next to the label —
// maxLength alone silently stops keystrokes with no visible feedback.
export function FormField({ label, htmlFor, className = '', children, ...inputProps }) {
    const { maxLength, value } = inputProps

    return (
        <div className={className}>
            <div className="flex items-baseline justify-between mb-1">
                <label className="block text-sm" htmlFor={htmlFor}>
                    {label}
                </label>
                {maxLength != null && (
                    <span className="text-xs text-ink-soft tabular">
                        {(value ?? '').length}/{maxLength}
                    </span>
                )}
            </div>
            {children ?? <input id={htmlFor} className={inputClass} {...inputProps} />}
        </div>
    )
}
