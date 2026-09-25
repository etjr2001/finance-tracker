import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { SignupPage } from '@features/auth/pages/SignupPage'
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@features/auth/pages/ResetPasswordPage'
import { AppLayout } from '@features/layout/components/AppLayout'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { TransactionsPage } from '@features/transactions/pages/TransactionsPage'
import { CategoriesPage } from '@features/categories/pages/CategoriesPage'
import { DemoProvider } from '@features/demo/components/DemoProvider'

// The same three app pages, mounted under both /demo and the protected
// root. A function (not a component) because <Routes> only accepts
// <Route> elements as children.
function appPageRoutes() {
    return [
        <Route key="dashboard" index element={<DashboardPage />} />,
        <Route key="transactions" path="transactions" element={<TransactionsPage />} />,
        <Route key="categories" path="categories" element={<CategoriesPage />} />,
    ]
}

export function App() {
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
                        <AppLayout />
                    </DemoProvider>
                }
            >
                {appPageRoutes()}
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AppLayout />}>
                    {appPageRoutes()}
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
