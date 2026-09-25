import { Button } from '@components/Button'
import { StatusMessage } from '@components/StatusMessage'

// Error line + full-width submit button that every auth form ends with.
export function AuthSubmitButton({ error, isSubmitting, label, pendingLabel }) {
    return (
        <>
            {error && <StatusMessage tone="error">{error}</StatusMessage>}
            <Button type="submit" isFullWidth disabled={isSubmitting}>
                {isSubmitting ? pendingLabel : label}
            </Button>
        </>
    )
}
