import axios from "axios";
import { supabase } from '../lib/supabaseClient'

export const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut()
            if (window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }
        return Promise.reject(error)
    }
)

export function apiErrorMessage(error, fallback = 'Something went wrong.') {
    return error?.response?.data?.error || error?.message || fallback
}
