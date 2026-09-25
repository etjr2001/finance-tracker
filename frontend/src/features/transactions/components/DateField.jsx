import { inputClass, nativeSelectResetClass } from '@components/formStyles'

export function DateField({ value, onChange }) {
    return (
        <div>
            <label className="block text-sm text-ink-soft mb-1" htmlFor="date">
                Date
            </label>
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
