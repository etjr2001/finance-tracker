import { useState } from 'react'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useAsyncSubmit } from '@hooks/useAsyncSubmit'
import { AuthCard } from '@features/auth/components/AuthCard'
import { AuthNotice } from '@features/auth/components/AuthNotice'
import { AuthFooterLink } from '@features/auth/components/AuthFooterLink'
import { AuthSubmitButton } from '@features/auth/components/AuthSubmitButton'
import { EmailField } from '@features/auth/components/EmailField'

export function ForgotPasswordPage() {
    const { requestPasswordReset } = useAuth()
    const [email, setEmail] = useState('')
    const [isSent, setIsSent] = useState(false)
    const { submit, error, isSubmitting } = useAsyncSubmit(async () => {
        await requestPasswordReset(email)
        setIsSent(true)
    }, 'Could not send reset email.')

    function handleSubmit(event) {
        event.preventDefault()
        submit()
    }

    if (isSent) {
        return (
            <AuthNotice title="Check your email" linkTo="/login" linkLabel="Back to log in">
                If an account exists for <span className="text-ink">{email}</span>, we've sent a link to reset your
                password.
            </AuthNotice>
        )
    }

    return (
        <AuthCard title="Reset password" subtitle="Enter your email and we'll send you a link to reset your password.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <EmailField value={email} onChange={setEmail} />
                <AuthSubmitButton error={error} isSubmitting={isSubmitting} label="Send reset link" pendingLabel="Sending…" />
            </form>

            <AuthFooterLink to="/login">Back to log in</AuthFooterLink>
        </AuthCard>
    )
}
