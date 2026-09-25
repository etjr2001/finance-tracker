import { useCallback, useState } from 'react'
import { apiErrorMessage } from '@api/httpClient'

// The "clear error → set pending → await → catch into a message" cycle
// every form repeated by hand. `submit` resolves to true on success and
// false on failure, so callers can branch without their own try/catch.
export function useAsyncSubmit(action, fallbackMessage) {
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = useCallback(
        async (...args) => {
            setError(null)
            setIsSubmitting(true)
            try {
                await action(...args)
                return true
            } catch (err) {
                setError(apiErrorMessage(err, fallbackMessage))
                return false
            } finally {
                setIsSubmitting(false)
            }
        },
        [action, fallbackMessage]
    )

    return { submit, error, setError, isSubmitting }
}
