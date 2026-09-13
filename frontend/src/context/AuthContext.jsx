import { createContext, useContext, useState, useCallback } from 'react'
import { getToken, setToken, clearToken } from '../api/client'
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => getToken())

    const login = useCallback(async (credentials) => {
        const { token } = await authApi.login(credentials)
        setToken(token)
        setTokenState(token)
    }, [])

    const signup = useCallback(async (credentials) => {
        const { token } = await authApi.signup(credentials)
        setToken(token)
        setTokenState(token)
    }, [])

    const logout = useCallback(() => {
        clearToken()
        setTokenState(null)
    }, [])

    const value = {
        token,
        isAuthenticated: Boolean(token),
        login,
        signup,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}