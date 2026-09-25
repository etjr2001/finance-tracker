import { inputClass } from '@components/formStyles'

// Label + control wrapper. Renders its own <input> by default; pass
// `children` to supply a different control (e.g. a <select>). Remaining
// props are forwarded to the <input> — this is a thin native-element
// wrapper, so forwarding (type, value, onChange, required…) is the point.
export function FormField({ label, htmlFor, className = '', children, ...inputProps }) {
    return (
        <div className={className}>
            <label className="block text-sm mb-1" htmlFor={htmlFor}>
                {label}
            </label>
            {children ?? <input id={htmlFor} className={inputClass} {...inputProps} />}
        </div>
    )
}
