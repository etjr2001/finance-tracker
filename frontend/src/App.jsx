import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

function LoginPlaceholder() {
    return <div>Login page (placeholder)</div>
}

function DashboardPlaceholder() {
    return <div>Dashboard (placeholder, protected)</div>
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPlaceholder />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPlaceholder />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App