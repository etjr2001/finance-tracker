import { Route, Navigate, Outlet, createRoutesFromElements } from 'react-router-dom'
import { AuthProvider } from '@features/auth/context/AuthProvider'
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { SignupPage } from '@features/auth/pages/SignupPage'
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@features/auth/pages/ResetPasswordPage'
import { AppLayout } from '@features/layout/components/AppLayout'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { TransactionsPage } from '@features/transactions/pages/TransactionsPage'
import { CategoriesPage } from '@features/categories/pages/CategoriesPage'
import { FavouritesPage } from '@features/favourites/pages/FavouritesPage'
import { DemoProvider } from '@features/demo/components/DemoProvider'

// The same app pages, mounted under both /demo and the protected
// root. A function (not a component) because only <Route> elements
// can be route children.
function appPageRoutes() {
    return [
        <Route key="dashboard" index element={<DashboardPage />} />,
        <Route key="transactions" path="transactions" element={<TransactionsPage />} />,
        <Route key="favourites" path="favourites" element={<FavouritesPage />} />,
        <Route key="categories" path="categories" element={<CategoriesPage />} />,
    ]
}

// Route objects for createBrowserRouter (main.jsx). Every route must be
// registered with the data router itself, not rendered by a nested
// <Routes>: React Router drops NavLink's `viewTransition` for links under
// a nested <Routes>, so page transitions would never run.
export const routes = createRoutesFromElements(
    <Route
        element={
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        }
    >
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
    </Route>
)
