import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return null
    }

    if (!isAuthenticated) {
        // /demo is the default landing page for logged-out visitors (ADR0009)
        // — a recruiter or interviewer should hit a working app, not a
        // signup wall.
        return <Navigate to="/demo" replace />
    }
    return <Outlet />
}
