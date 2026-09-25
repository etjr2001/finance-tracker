import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useAsyncSubmit } from '@hooks/useAsyncSubmit'
import { AuthCard } from '@features/auth/components/AuthCard'
import { AuthFooterLink } from '@features/auth/components/AuthFooterLink'
import { AuthSubmitButton } from '@features/auth/components/AuthSubmitButton'
import { EmailField } from '@features/auth/components/EmailField'
import { PasswordField } from '@features/auth/components/PasswordField'

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { submit, error, isSubmitting } = useAsyncSubmit(async () => {
        await login({ email, password })
        navigate('/', { replace: true })
    }, 'Could not log in.')

    function handleSubmit(event) {
        event.preventDefault()
        submit()
    }

    return (
        <AuthCard title="Ledger" subtitle="Log in to your account.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <EmailField value={email} onChange={setEmail} />
                <div>
                    <PasswordField value={password} onChange={setPassword} />
                    <Link to="/forgot-password" className="block mt-1 text-xs text-ink-soft underline underline-offset-2">
                        Forgot password?
                    </Link>
                </div>
                <AuthSubmitButton error={error} isSubmitting={isSubmitting} label="Log in" pendingLabel="Logging in…" />
            </form>

            <AuthFooterLink to="/signup" prompt="No account?">
                Sign up
            </AuthFooterLink>
            <AuthFooterLink to="/demo" className="mt-2">
                Back to demo
            </AuthFooterLink>
        </AuthCard>
    )
}
