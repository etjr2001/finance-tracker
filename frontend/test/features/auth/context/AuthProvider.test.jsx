import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@features/auth/context/AuthProvider'
import { supabase } from '@api/supabaseClient'
import { queryKeys } from '@api/queryKeys'

vi.mock('@api/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
    },
}))
vi.mock('@features/auth/api/usersApi', () => ({
    bootstrapUser: vi.fn(() => Promise.resolve()),
}))

// Captures the callback AuthProvider registers, so a test can fire auth
// events (SIGNED_IN, SIGNED_OUT…) as Supabase would.
let emitAuthEvent

function renderProvider(queryClient) {
    return render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div />
            </AuthProvider>
        </QueryClientProvider>
    )
}

function queryClientWithCachedData() {
    const queryClient = new QueryClient()
    queryClient.setQueryData(queryKeys.transactionsForMonth(false, '2026-09'), [{ id: 1 }])
    queryClient.setQueryData(queryKeys.dashboardForMonth(false, '2026-09'), { net: 100 })
    return queryClient
}

describe('AuthProvider query cache', () => {
    beforeEach(() => {
        supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'a' } } } })
        supabase.auth.onAuthStateChange.mockImplementation((callback) => {
            emitAuthEvent = callback
            return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
    })

    // Query keys aren't scoped by User, so without this the next User to
    // log in on the same tab could briefly see the previous User's cached
    // Transactions and Dashboard (CONTEXT.md: no one else can see them).
    it('empties the cache when the User signs out', async () => {
        const queryClient = queryClientWithCachedData()
        renderProvider(queryClient)
        await waitFor(() => expect(supabase.auth.onAuthStateChange).toHaveBeenCalled())

        act(() => emitAuthEvent('SIGNED_OUT', null))

        expect(queryClient.getQueryData(queryKeys.transactionsForMonth(false, '2026-09'))).toBeUndefined()
        expect(queryClient.getQueryData(queryKeys.dashboardForMonth(false, '2026-09'))).toBeUndefined()
    })

    // Signing in as User B over User A's session (e.g. A's tab goes straight
    // to /login) swaps the session with SIGNED_IN only, no SIGNED_OUT first.
    it('empties the cache when a different User signs in over the current one', async () => {
        const queryClient = queryClientWithCachedData()
        renderProvider(queryClient)
        await waitFor(() => expect(supabase.auth.onAuthStateChange).toHaveBeenCalled())
        act(() => emitAuthEvent('INITIAL_SESSION', { user: { id: 'a' } }))

        act(() => emitAuthEvent('SIGNED_IN', { user: { id: 'b' } }))

        expect(queryClient.getQueryData(queryKeys.transactionsForMonth(false, '2026-09'))).toBeUndefined()
    })

    it('keeps the cache when the same User signs in again', async () => {
        const queryClient = queryClientWithCachedData()
        renderProvider(queryClient)
        await waitFor(() => expect(supabase.auth.onAuthStateChange).toHaveBeenCalled())
        act(() => emitAuthEvent('INITIAL_SESSION', { user: { id: 'a' } }))

        act(() => emitAuthEvent('SIGNED_IN', { user: { id: 'a' } }))

        expect(queryClient.getQueryData(queryKeys.transactionsForMonth(false, '2026-09'))).toEqual([{ id: 1 }])
    })

    it('keeps the cache on other auth events, like a token refresh', async () => {
        const queryClient = queryClientWithCachedData()
        renderProvider(queryClient)
        await waitFor(() => expect(supabase.auth.onAuthStateChange).toHaveBeenCalled())

        act(() => emitAuthEvent('TOKEN_REFRESHED', { user: { id: 'a' } }))

        expect(queryClient.getQueryData(queryKeys.transactionsForMonth(false, '2026-09'))).toEqual([{ id: 1 }])
    })
})
