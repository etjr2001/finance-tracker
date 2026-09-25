import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@features/auth/hooks/useAuth'

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return null

    // /demo is the landing page for logged-out visitors (ADR0009): a
    // recruiter or interviewer should hit a working app, not a signup wall.
    if (!isAuthenticated) return <Navigate to="/demo" replace />

    return <Outlet />
}
