import { inputClass } from '@components/formStyles'
import { FieldLabel, FieldNote } from '@components/FieldLabel'
import { useFieldHelp } from '@hooks/useFieldHelp'

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
    const fieldHelp = useFieldHelp({ id: 'amount', help, helper })

    return (
        <div>
            <FieldLabel label="Amount" htmlFor="amount" labelClassName="text-ink-soft" {...fieldHelp.labelProps} />
            <input
                id="amount"
                type="text"
                inputMode="decimal"
                required
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={(event) => event.target.select()}
                aria-describedby={fieldHelp.describedBy}
                className={`${inputClass} ${isZero ? 'text-ink-soft' : ''}`}
            />
            {hint && <p className="mt-1 text-xs text-withdrawal">{HINTS[hint]}</p>}
            <FieldNote id={fieldHelp.noteId}>{fieldHelp.note}</FieldNote>
        </div>
    )
}
