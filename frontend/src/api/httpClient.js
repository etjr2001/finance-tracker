import axios from 'axios'
import { supabase } from '@api/supabaseClient'

const LOGIN_PATH = '/login'

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
            if (window.location.pathname !== LOGIN_PATH) {
                window.location.assign(LOGIN_PATH)
            }
        }
        return Promise.reject(error)
    }
)

// Unwraps axios' response envelope so every feature API module returns
// plain data, without repeating `.then((res) => res.data)` on each call.
export function unwrap(request) {
    return request.then((response) => response.data)
}

export function apiErrorMessage(error, fallback = 'Something went wrong.') {
    return error?.response?.data?.error || error?.message || fallback
}
