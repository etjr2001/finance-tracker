import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'
import FormField from '../components/FormField'
import Button from '../components/Button'

export default function ForgotPasswordPage() {
    const { requestPasswordReset } = useAuth()
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await requestPasswordReset(email)
            setSent(true)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not send reset email.'))
        } finally {
            setSubmitting(false)
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="font-serif font-semibold text-3xl mb-1">Check your email</h1>
                    <p className="text-ink-soft text-sm mt-4">
                        If an account exists for <span className="text-ink">{email}</span>, we've sent a link to reset your password.
                    </p>
                    <Link to="/login" className="inline-block mt-6 text-ink underline underline-offset-2 text-sm">
                        Back to log in
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <h1 className="font-serif font-semibold text-3xl mb-1">Reset password</h1>
                <p className="text-ink-soft text-sm mb-8">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Email"
                        htmlFor="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? 'Sending…' : 'Send reset link'}
                    </Button>
                </form>

                <p className="text-sm text-ink-soft mt-6">
                    <Link to="/login" className="text-ink underline underline-offset-2">
                        Back to log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
