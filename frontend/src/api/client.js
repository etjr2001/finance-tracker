import axios from "axios";

const TOKEN_KEY = 'finance_tracker_token'

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearToken()
            if (window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }
        return Promise.reject(error)
    }
)

export function apiErrorMessage(error, fallback = 'Something went wrong.') {
    return error?.response?.data?.error || fallback
}