import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'
import FormField from '../components/FormField'
import Button from '../components/Button'

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

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <h1 className="font-serif font-semibold text-3xl mb-1">Ledger</h1>
                <p className="text-ink-soft text-sm mb-8">Log in to your account.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Email"
                        htmlFor="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div>
                        <FormField
                            label="Password"
                            htmlFor="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Link to="/forgot-password" className="block mt-1 text-xs text-ink-soft underline underline-offset-2">
                            Forgot password?
                        </Link>
                    </div>

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? 'Logging in…' : 'Log in'}
                    </Button>
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
