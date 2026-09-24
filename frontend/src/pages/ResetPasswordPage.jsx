import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { apiErrorMessage } from '../api/client'
import FormField from '../components/FormField'
import Button from '../components/Button'

export default function ResetPasswordPage() {
    const { isPasswordRecovery, updatePassword, loading } = useAuth()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        setError(null)
        setSubmitting(true)
        try {
            await updatePassword(password)
            setDone(true)
        } catch (err) {
            setError(apiErrorMessage(err, 'Could not reset password.'))
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return null
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="font-serif font-semibold text-3xl mb-1">Password updated</h1>
                    <p className="text-ink-soft text-sm mt-4">You can now use your new password to log in.</p>
                    <Link to="/" className="inline-block mt-6 text-ink underline underline-offset-2 text-sm">
                        Continue
                    </Link>
                </div>
            </div>
        )
    }

    if (!isPasswordRecovery) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="font-serif font-semibold text-3xl mb-1">Link expired</h1>
                    <p className="text-ink-soft text-sm mt-4">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" className="inline-block mt-6 text-ink underline underline-offset-2 text-sm">
                        Request a new link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <h1 className="font-serif font-semibold text-3xl mb-1">Set a new password</h1>
                <p className="text-ink-soft text-sm mb-8">Choose a new password for your account.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="New password"
                        htmlFor="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormField
                        label="Confirm password"
                        htmlFor="confirm"
                        type="password"
                        required
                        minLength={8}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />

                    {error && <p className="text-withdrawal text-sm">{error}</p>}

                    <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? 'Updating…' : 'Update password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
