import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../lib/supabaseClient'
import { bootstrapUser } from '../api/users'

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

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
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const signup = useCallback(async ({ email, password }) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        return { needsConfirmation: !data.session }
    }, [])

    const login = useCallback(async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }, [])

    const logout = useCallback(async () => {
        await supabase.auth.signOut()
    }, [])

    const value = { session, isAuthenticated: Boolean(session), loading, login, signup, logout }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}