import { useState } from 'react'
import { inputClass } from '@components/formStyles'
import { FieldLabel } from '@components/FieldLabel'

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
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const helpId = `${htmlFor}-help`
    const isShowingHelp = Boolean(help) && isHelpOpen
    const note = isShowingHelp ? help : helper

    return (
        <div className={className}>
            <FieldLabel
                label={label}
                htmlFor={htmlFor}
                helpId={helpId}
                isHelpOpen={isHelpOpen}
                onToggleHelp={help ? () => setIsHelpOpen((open) => !open) : undefined}
                maxLength={maxLength}
                value={value}
            />
            {children ?? (
                <input
                    id={htmlFor}
                    className={inputClass}
                    aria-describedby={isShowingHelp ? helpId : undefined}
                    {...inputProps}
                />
            )}
            {note && (
                <p id={isShowingHelp ? helpId : undefined} className="mt-1 text-xs text-ink-soft">
                    {note}
                </p>
            )}
        </div>
    )
}
