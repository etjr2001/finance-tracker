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
import { RouteError } from '@features/layout/components/RouteError'

// The same app pages, mounted under both /demo and the protected
// root. A function (not a component) because only <Route> elements
// can be route children. Each page's errorElement renders inside
// AppLayout's <Outlet />, so a crashed page keeps the nav.
function appPageRoutes() {
    const pageError = <RouteError />
    return [
        <Route key="dashboard" index element={<DashboardPage />} errorElement={pageError} />,
        <Route key="transactions" path="transactions" element={<TransactionsPage />} errorElement={pageError} />,
        <Route key="favourites" path="favourites" element={<FavouritesPage />} errorElement={pageError} />,
        <Route key="categories" path="categories" element={<CategoriesPage />} errorElement={pageError} />,
    ]
}

// Route objects for createBrowserRouter (main.jsx). Every route must be
// registered with the data router itself, not rendered by a nested
// <Routes>: React Router drops NavLink's `viewTransition` for links under
// a nested <Routes>, so page transitions would never run.
// The root errorElement is the fallback for anything outside a page (the
// layout, auth pages, AuthProvider itself); it takes the whole screen.
export const routes = createRoutesFromElements(
    <Route
        element={
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        }
        errorElement={<RouteError isFullPage />}
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
