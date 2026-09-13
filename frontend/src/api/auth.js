import { api } from './client'

export function signup({ email, password }) {
    return api.post('/auth/signup', { email, password }).then((res) => res.data)
}

export function login({ email, password }) {
    return api.post('/auth/login', { email, password }).then((res) => res.data)
}