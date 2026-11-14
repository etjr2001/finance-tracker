import { inputClass } from '@components/formStyles'
import { FieldLabel } from '@components/FieldLabel'

// Label + control wrapper. Renders its own <input> by default; pass
// `children` to supply a different control (e.g. a <select>). Remaining
// props are forwarded to the <input> — this is a thin native-element
// wrapper, so forwarding (type, value, onChange, required…) is the point.
// A maxLength prop also renders a live "N/max" counter next to the label —
// maxLength alone silently stops keystrokes with no visible feedback.
// `help` puts an (i) by the label that shows the text when tapped;
// `helper` adds always-on muted text under the control.
export function FormField({ label, htmlFor, help, helper, className = '', children, ...inputProps }) {
    const { maxLength, value } = inputProps

    return (
        <div className={className}>
            <FieldLabel label={label} htmlFor={htmlFor} help={help} maxLength={maxLength} value={value} />
            {children ?? <input id={htmlFor} className={inputClass} {...inputProps} />}
            {helper && <p className="mt-1 text-xs text-ink-soft">{helper}</p>}
        </div>
    )
}
