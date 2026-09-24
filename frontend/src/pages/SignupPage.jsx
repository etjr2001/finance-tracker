import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'
import FormField from '../components/FormField'
import Button from '../components/Button'
import Card from '../components/Card'

export default function SignupPage() {
    const { signup } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [confirmationSent, setConfirmationSent] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const { needsConfirmation } = await signup({ email, password })
            if (needsConfirmation) {
                setConfirmationSent(true)
            } else {
                navigate('/', { replace: true })
            }
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not sign up.'))
        } finally {
            setSubmitting(false)
        }
    }

    if (confirmationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
                <Card className="w-full max-w-sm p-8 text-center">
                    <h1 className="font-serif font-semibold text-3xl mb-1">Check your email</h1>
                    <p className="text-ink-soft text-sm mt-4">
                        We've sent a confirmation link to <span className="text-ink">{email}</span>.
                        Click it to activate your account, then log in.
                    </p>
                    <Link to="/login" className="inline-block mt-6 text-ink underline underline-offset-2 text-sm">
                        Back to log in
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
            <Card className="w-full max-w-sm p-8">
                <h1 className="font-serif font-semibold text-3xl mb-1">Ledger</h1>
                <p className="text-ink-soft text-sm mb-8">
                    Create an account. We'll set you up with five starter categories.
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
                    <FormField
                        label="Password"
                        htmlFor="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? 'Creating account…' : 'Sign up'}
                    </Button>
                </form>

                <p className="text-sm text-ink-soft mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-ink underline underline-offset-2">
                        Log in
                    </Link>
                </p>
            </Card>
        </div>
    )
}
