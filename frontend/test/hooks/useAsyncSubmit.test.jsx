import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAsyncSubmit } from '@hooks/useAsyncSubmit'

describe('useAsyncSubmit', () => {
    it('resolves true and leaves no error on success', async () => {
        const action = vi.fn().mockResolvedValue(undefined)
        const { result } = renderHook(() => useAsyncSubmit(action, 'Failed.'))

        let isOk
        await act(async () => {
            isOk = await result.current.submit('arg')
        })

        expect(isOk).toBe(true)
        expect(action).toHaveBeenCalledWith('arg')
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it('resolves false and exposes the error message on failure', async () => {
        const action = vi.fn().mockRejectedValue(new Error('boom'))
        const { result } = renderHook(() => useAsyncSubmit(action, 'Failed.'))

        let isOk
        await act(async () => {
            isOk = await result.current.submit()
        })

        expect(isOk).toBe(false)
        expect(result.current.error).toBe('boom')
    })
})
