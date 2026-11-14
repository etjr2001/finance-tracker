import { inputClass } from '@components/formStyles'
import { FieldLabel, FieldNote } from '@components/FieldLabel'
import { useFieldHelp } from '@hooks/useFieldHelp'

// Label + control wrapper. Renders its own <input> by default; pass
// `children` to supply a different control (e.g. a <select>). Remaining
// props are forwarded to the <input> — this is a thin native-element
// wrapper, so forwarding (type, value, onChange, required…) is the point.
// A maxLength prop also renders a live "N/max" counter next to the label —
// maxLength alone silently stops keystrokes with no visible feedback.
// `helper` adds always-on muted text under the control. `help` puts an (i)
// by the label; tapping it shows `help` under the control, in place of
// `helper`. With `children`, wiring aria-describedby to `${htmlFor}-help`
// is up to the caller.
export function FormField({ label, htmlFor, help, helper, className = '', children, ...inputProps }) {
    const { maxLength, value } = inputProps
    const fieldHelp = useFieldHelp({ id: htmlFor, help, helper })

    return (
        <div className={className}>
            <FieldLabel label={label} htmlFor={htmlFor} maxLength={maxLength} value={value} {...fieldHelp.labelProps} />
            {children ?? (
                <input id={htmlFor} className={inputClass} aria-describedby={fieldHelp.describedBy} {...inputProps} />
            )}
            <FieldNote id={fieldHelp.noteId}>{fieldHelp.note}</FieldNote>
        </div>
    )
}
