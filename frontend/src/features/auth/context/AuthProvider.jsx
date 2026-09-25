import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@features/auth/context/AuthContext'
import { supabase } from '@api/supabaseClient'
import { bootstrapUser } from '@features/auth/api/usersApi'

// Throws Supabase's error object so callers' catch blocks see a message.
function throwIfError(error) {
    if (error) throw error
}

// Session state + Supabase subscription. Kept separate from the action
// functions below so the provider only wires the two together.
function useSupabaseSession() {
    const [session, setSession] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

    useEffect(() => {
        let isActive = true

        supabase.auth.getSession().then(({ data }) => {
            if (!isActive) return
            setSession(data.session)
            setIsLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession)
            if (event === 'SIGNED_IN') bootstrapUser().catch(() => {})
            if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
        })

        return () => {
            isActive = false
            listener.subscription.unsubscribe()
        }
    }, [])

    return { session, setSession, isLoading, isPasswordRecovery, setIsPasswordRecovery }
}

export function AuthProvider({ children }) {
    const { session, setSession, isLoading, isPasswordRecovery, setIsPasswordRecovery } = useSupabaseSession()

    // All actions only close over stable state setters, so they're created
    // once; the context value then only changes when real state changes.
    const actions = useMemo(
        () => ({
            async signup({ email, password }) {
                const { data, error } = await supabase.auth.signUp({ email, password })
                throwIfError(error)
                if (data.session) setSession(data.session)
                return { needsConfirmation: !data.session }
            },
            async login({ email, password }) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password })
                throwIfError(error)
                setSession(data.session)
            },
            async logout() {
                await supabase.auth.signOut()
            },
            async requestPasswordReset(email) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                })
                throwIfError(error)
            },
            async updatePassword(newPassword) {
                const { error } = await supabase.auth.updateUser({ password: newPassword })
                throwIfError(error)
                setIsPasswordRecovery(false)
            },
        }),
        [setSession, setIsPasswordRecovery]
    )

    const value = useMemo(
        () => ({
            session,
            isAuthenticated: Boolean(session),
            isPasswordRecovery,
            isLoading,
            ...actions,
        }),
        [session, isPasswordRecovery, isLoading, actions]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
