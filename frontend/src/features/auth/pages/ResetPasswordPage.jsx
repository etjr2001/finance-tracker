import { useState } from 'react'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useAsyncSubmit } from '@hooks/useAsyncSubmit'
import { AuthCard } from '@features/auth/components/AuthCard'
import { AuthNotice } from '@features/auth/components/AuthNotice'
import { AuthSubmitButton } from '@features/auth/components/AuthSubmitButton'
import { PasswordField } from '@features/auth/components/PasswordField'

export function ResetPasswordPage() {
    const { isPasswordRecovery, updatePassword, isLoading } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [isDone, setIsDone] = useState(false)
    const { submit, error, setError, isSubmitting } = useAsyncSubmit(async () => {
        await updatePassword(password)
        setIsDone(true)
    }, 'Could not reset password.')

    function handleSubmit(event) {
        event.preventDefault()
        if (password !== confirmation) {
            setError('Passwords do not match.')
            return
        }
        submit()
    }

    if (isLoading) return null

    if (isDone) {
        return (
            <AuthNotice title="Password updated" linkTo="/" linkLabel="Continue">
                You can now use your new password to log in.
            </AuthNotice>
        )
    }

    if (!isPasswordRecovery) {
        return (
            <AuthNotice title="Link expired" linkTo="/forgot-password" linkLabel="Request a new link">
                This password reset link is invalid or has expired.
            </AuthNotice>
        )
    }

    return (
        <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField label="New password" value={password} onChange={setPassword} hasMinLength />
                <PasswordField id="confirm" label="Confirm password" value={confirmation} onChange={setConfirmation} hasMinLength />
                <AuthSubmitButton error={error} isSubmitting={isSubmitting} label="Update password" pendingLabel="Updating…" />
            </form>
        </AuthCard>
    )
}
