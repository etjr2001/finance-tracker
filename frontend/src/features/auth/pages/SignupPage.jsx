import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useAsyncSubmit } from '@hooks/useAsyncSubmit'
import { AuthCard } from '@features/auth/components/AuthCard'
import { AuthNotice } from '@features/auth/components/AuthNotice'
import { AuthFooterLink } from '@features/auth/components/AuthFooterLink'
import { AuthSubmitButton } from '@features/auth/components/AuthSubmitButton'
import { EmailField } from '@features/auth/components/EmailField'
import { PasswordField } from '@features/auth/components/PasswordField'

export function SignupPage() {
    const { signup } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isConfirmationSent, setIsConfirmationSent] = useState(false)
    const { submit, error, isSubmitting } = useAsyncSubmit(async () => {
        const { needsConfirmation } = await signup({ email, password })
        if (needsConfirmation) {
            setIsConfirmationSent(true)
            return
        }
        navigate('/', { replace: true })
    }, 'Could not sign up.')

    function handleSubmit(event) {
        event.preventDefault()
        submit()
    }

    if (isConfirmationSent) {
        return (
            <AuthNotice title="Check your email" linkTo="/login" linkLabel="Back to log in">
                We've sent a confirmation link to <span className="text-ink">{email}</span>. Click it to activate your
                account, then log in.
            </AuthNotice>
        )
    }

    return (
        <AuthCard title="Ledger" subtitle="Create an account. We'll set you up with five starter categories.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <EmailField value={email} onChange={setEmail} />
                <PasswordField value={password} onChange={setPassword} hasMinLength />
                <AuthSubmitButton error={error} isSubmitting={isSubmitting} label="Sign up" pendingLabel="Creating account…" />
            </form>

            <AuthFooterLink to="/login" prompt="Already have an account?">
                Log in
            </AuthFooterLink>
        </AuthCard>
    )
}
