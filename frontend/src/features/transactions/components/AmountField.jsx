import { inputClass } from '@components/formStyles'

const HINTS = {
    overMax: 'Max amount is 9,999,999,999.99',
    tooManyDecimals: 'Only 2 decimal places allowed',
}

// type="text" + inputMode="decimal" gives the clean 0-9 + dot keypad on
// both iOS and Android; filtering happens in the form-state hook.
export function AmountField({ value, onChange, hint }) {
    const isZero = Number(value) === 0

    return (
        <div>
            <label className="block text-sm text-ink-soft mb-1" htmlFor="amount">
                Amount
            </label>
            <input
                id="amount"
                type="text"
                inputMode="decimal"
                required
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={(event) => event.target.select()}
                className={`${inputClass} ${isZero ? 'text-ink-soft' : ''}`}
            />
            {hint && <p className="mt-1 text-xs text-withdrawal">{HINTS[hint]}</p>}
        </div>
    )
}
