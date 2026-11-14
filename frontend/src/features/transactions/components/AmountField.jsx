import { useState } from 'react'
import { inputClass } from '@components/formStyles'
import { FieldLabel } from '@components/FieldLabel'

const HINTS = {
    overMax: 'Max amount is 9,999,999,999.99',
    tooManyDecimals: 'Only 2 decimal places allowed',
}

// type="text" + inputMode="decimal" gives the clean 0-9 + dot keypad on
// both iOS and Android; filtering happens in the form-state hook.
// `hint` is a blocked-keystroke warning and always shows. `helper` is short
// muted guidance (e.g. "0 shows as a Draft"). `help` puts an (i) by the
// label; tapping it shows `help` under the input, in place of `helper`.
export function AmountField({ value, onChange, hint, helper, help }) {
    const isZero = Number(value) === 0
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const helpId = 'amount-help'
    const isShowingHelp = Boolean(help) && isHelpOpen
    const note = isShowingHelp ? help : helper

    return (
        <div>
            <FieldLabel
                label="Amount"
                htmlFor="amount"
                helpId={helpId}
                isHelpOpen={isHelpOpen}
                onToggleHelp={help ? () => setIsHelpOpen((open) => !open) : undefined}
                labelClassName="text-ink-soft"
            />
            <input
                id="amount"
                type="text"
                inputMode="decimal"
                required
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={(event) => event.target.select()}
                aria-describedby={isShowingHelp ? helpId : undefined}
                className={`${inputClass} ${isZero ? 'text-ink-soft' : ''}`}
            />
            {hint && <p className="mt-1 text-xs text-withdrawal">{HINTS[hint]}</p>}
            {note && (
                <p id={isShowingHelp ? helpId : undefined} className="mt-1 text-xs text-ink-soft">
                    {note}
                </p>
            )}
        </div>
    )
}
