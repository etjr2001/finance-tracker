import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { resetDemoData } from './demoApi'

export default function DemoBanner() {
    const queryClient = useQueryClient()

    function handleReset() {
        resetDemoData()
        queryClient.invalidateQueries({ queryKey: ['transactions', true] })
        queryClient.invalidateQueries({ queryKey: ['categories', true] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', true] })
    }

    return (
        <div className="sticky top-0 z-10 bg-paper-raised border-b border-rule px-4 py-2 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <span>
                You're viewing a demo. Nothing here is saved to a real account.{' '}
                <Link to="/login" className="text-ink underline underline-offset-2">
                    Log in
                </Link>{' '}
                or{' '}
                <Link to="/signup" className="text-ink underline underline-offset-2">
                    sign up
                </Link>{' '}
                to keep your data.
            </span>
            <button onClick={handleReset} className="text-ink underline underline-offset-2 hover:no-underline shrink-0">
                Reset demo data
            </button>
        </div>
    )
}
