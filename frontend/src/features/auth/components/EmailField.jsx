import { FormField } from '@components/FormField'

export function EmailField({ value, onChange }) {
    return (
        <FormField
            label="Email"
            htmlFor="email"
            type="email"
            required
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    )
}
