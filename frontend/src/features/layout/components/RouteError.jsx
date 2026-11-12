import { useLocation, useRouteError } from 'react-router-dom'
import { PageTitle } from '@components/PageTitle'
import { StatusMessage } from '@components/StatusMessage'
import { Button } from '@components/Button'

// errorElement for the routes (App.jsx), in place of React Router's bare
// "Unexpected Application Error" page.
// - On a page route it renders inside AppLayout, so the nav stays and the
//   User can just move to another page.
// - `isFullPage` is the root fallback, for when the layout itself is what
//   broke: no nav, so it also links back to the Dashboard (under /demo in
//   demo mode, matching where the User was).
export function RouteError({ isFullPage = false }) {
    const error = useRouteError()
    const { pathname } = useLocation()
    const homePath = pathname.startsWith('/demo') ? '/demo' : '/'

    const content = (
        <div>
            <PageTitle>Something went wrong</PageTitle>
            <StatusMessage className="mb-6">
                This page hit an unexpected error. Reloading usually fixes it.
            </StatusMessage>
            {/* The real message only in development; Users get the plain line above. */}
            {import.meta.env.DEV && error?.message && (
                <StatusMessage tone="error" className="mb-6 font-mono">
                    {error.message}
                </StatusMessage>
            )}
            <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.location.reload()}>Reload</Button>
                {/* A full page load, not a router navigation: whatever broke
                    the layout shouldn't survive into the next screen. */}
                {isFullPage && (
                    <Button variant="secondary" onClick={() => window.location.assign(homePath)}>
                        Go to Dashboard
                    </Button>
                )}
            </div>
        </div>
    )

    // Same gutters as AppLayout's <main>, since there's no layout around it.
    return isFullPage ? <div className="min-h-screen p-6 md:p-10 max-w-[1100px] mx-auto">{content}</div> : content
}
