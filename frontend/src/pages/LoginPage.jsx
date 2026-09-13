import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

    return (
        <div style={{ padding: 20, maxWidth: 320 }}>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label><br />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div style={{ marginTop: 8 }}>
                    <label>Password</label><br />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={submitting} style={{ marginTop: 12 }}>
                    {submitting ? 'Logging in…' : 'Log in'}
                </button>
            </form>
        </div>
    )
}