import { inputClass, nativeSelectResetClass } from '@components/formStyles'
import { FieldLabel } from '@components/FieldLabel'

export function DateField({ value, onChange }) {
    return (
        <div>
            <FieldLabel label="Date" htmlFor="date" labelClassName="text-ink-soft" />
            <input
                id="date"
                type="date"
                required
                value={value}
                onChange={(event) => onChange(event.target.value)}
                // Open the native picker on a click anywhere in the field;
                // optional-chained for browsers without showPicker().
                onClick={(event) => event.target.showPicker?.()}
                className={`${inputClass} ${nativeSelectResetClass}`}
            />
        </div>
    )
}
