import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'

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

    const inputClass =
        'w-full border border-rule bg-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ink'

    if (confirmationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="font-serif text-3xl mb-1">Check your email</h1>
                    <p className="text-ink-soft text-sm mt-4">
                        We've sent a confirmation link to <span className="text-ink">{email}</span>.
                        Click it to activate your account, then log in.
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
                <h1 className="font-serif text-3xl mb-1">Ledger</h1>
                <p className="text-ink-soft text-sm mb-8">
                    Create an account. We'll set you up with five starter categories.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-ink text-paper py-2 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? 'Creating account…' : 'Sign up'}
                    </button>
                </form>

                <p className="text-sm text-ink-soft mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-ink underline underline-offset-2">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
