// Label + control wrapper, standardizing the <label>/margin pattern
// repeated across every form. Renders its own <input> when `as` is left
// at the default; pass a different element (e.g. a <select>) as children
// instead when the field needs one, via the `children` escape hatch.
export const inputClass =
    'w-full border border-rule-strong bg-white px-3 py-2 rounded-sm text-base focus:outline-none focus:ring-1 focus:ring-ink'

export default function FormField({ label, htmlFor, className = '', children, ...inputProps }) {
    return (
        <div className={className}>
            <label className="block text-sm mb-1" htmlFor={htmlFor}>
                {label}
            </label>
            {children ?? <input id={htmlFor} className={inputClass} {...inputProps} />}
        </div>
    )
}
