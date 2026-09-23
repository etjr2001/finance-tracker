import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import CategoriesPage from './pages/CategoriesPage'
import DemoProvider from './demo/DemoProvider'

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
                path="/demo"
                element={
                    <DemoProvider>
                        <Layout />
                    </DemoProvider>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App