import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await login({ email, password })
            navigate('/', { replace: true })
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not log in.'))
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass =
        'w-full border border-rule bg-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ink'

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <h1 className="font-serif text-3xl mb-1">Ledger</h1>
                <p className="text-ink-soft text-sm mb-8">Log in to your account.</p>

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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                        />
                        <Link to="/forgot-password" className="block mt-1 text-xs text-ink-soft underline underline-offset-2">
                            Forgot password?
                        </Link>
                    </div>

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-ink text-paper py-2 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <p className="text-sm text-ink-soft mt-6">
                    No account?{' '}
                    <Link to="/signup" className="text-ink underline underline-offset-2">
                        Sign up
                    </Link>
                </p>
                <p className="text-sm text-ink-soft mt-2">
                    <Link to="/demo" className="text-ink underline underline-offset-2">
                        Back to demo
                    </Link>
                </p>
            </div>
        </div>
    )
}