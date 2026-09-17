import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../lib/supabaseClient'
import { bootstrapUser } from '../api/users'

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
            setSession(newSession)

            if (event === 'SIGNED_IN') {
                bootstrapUser().catch(() => {})
            }
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true)
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const signup = useCallback(async ({ email, password }) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.session) {
            setSession(data.session)
        }
        return { needsConfirmation: !data.session }
    }, [])

    const login = useCallback(async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSession(data.session)
    }, [])

    const logout = useCallback(async () => {
        await supabase.auth.signOut()
    }, [])

    const requestPasswordReset = useCallback(async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
    }, [])

    const updatePassword = useCallback(async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        setIsPasswordRecovery(false)
    }, [])

    const value = {
        session,
        isAuthenticated: Boolean(session),
        isPasswordRecovery,
        loading,
        login,
        signup,
        logout,
        requestPasswordReset,
        updatePassword,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}