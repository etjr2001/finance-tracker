import { FormField } from '@components/FormField'

export const MIN_PASSWORD_LENGTH = 8

export function PasswordField({ id = 'password', label = 'Password', value, onChange, hasMinLength = false }) {
    return (
        <FormField
            label={label}
            htmlFor={id}
            type="password"
            required
            minLength={hasMinLength ? MIN_PASSWORD_LENGTH : undefined}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    )
}
