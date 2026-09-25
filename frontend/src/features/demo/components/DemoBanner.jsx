import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { resetDemoData } from '@features/demo/api/demoApi'
import { queryKeys } from '@api/queryKeys'

const DEMO_QUERY_KEYS = [queryKeys.transactions(true), queryKeys.categories(true), queryKeys.dashboard(true)]

function InlineLink({ to, children }) {
    return (
        <Link to={to} className="text-ink underline underline-offset-2">
            {children}
        </Link>
    )
}

export function DemoBanner() {
    const queryClient = useQueryClient()

    function handleReset() {
        resetDemoData()
        DEMO_QUERY_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    }

    return (
        <div className="sticky top-0 z-10 bg-paper-raised border-b border-rule px-4 py-2 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <span>
                You're viewing a demo. Nothing here is saved to a real account.{' '}
                <InlineLink to="/login">Log in</InlineLink> or <InlineLink to="/signup">sign up</InlineLink> to keep
                your data.
            </span>
            <button onClick={handleReset} className="text-ink underline underline-offset-2 hover:no-underline shrink-0">
                Reset demo data
            </button>
        </div>
    )
}
