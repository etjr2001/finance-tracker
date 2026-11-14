import { useState } from 'react'
import { Info } from 'lucide-react'

// The label row above a form control: the label, an optional (i) that
// toggles `help` text inline below the row (tap, not hover, so it works on
// mobile), and an optional "N/max" counter on the right.
// The (i) is a 20px icon; its ::before stretches the hit area to 44×44
// without making the row taller.
export function FieldLabel({ label, htmlFor, help, maxLength, value, labelClassName = '' }) {
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const helpId = `${htmlFor}-help`

    return (
        <>
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                    <label className={`block text-sm ${labelClassName}`} htmlFor={htmlFor}>
                        {label}
                    </label>
                    {help && (
                        <button
                            type="button"
                            onClick={() => setIsHelpOpen((open) => !open)}
                            aria-label={`About ${label}`}
                            aria-expanded={isHelpOpen}
                            aria-controls={helpId}
                            className="relative inline-flex h-5 w-5 items-center justify-center text-ink-soft hover:text-ink before:absolute before:-inset-3"
                        >
                            <Info aria-hidden="true" strokeWidth={1.7} className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                {maxLength != null && (
                    <span className="text-xs text-ink-soft tabular">
                        {(value ?? '').length}/{maxLength}
                    </span>
                )}
            </div>
            {help && isHelpOpen && (
                <p id={helpId} className="mb-1 text-xs text-ink-soft">
                    {help}
                </p>
            )}
        </>
    )
}
