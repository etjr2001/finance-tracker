import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from '@hooks/useReducedMotion'

// Same reactive fake as useIsMobile's test: setup.js's polyfill only
// supports a fixed value.
function mockMatchMedia(initialMatches) {
    let matches = initialMatches
    let listener = null
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        get matches() {
            return query.includes('reduce') && matches
        },
        addEventListener: (_event, cb) => {
            listener = cb
        },
        removeEventListener: vi.fn(),
    }))
    return {
        setMatches(value) {
            matches = value
            listener?.()
        },
    }
}

describe('useReducedMotion', () => {
    const defaultMatchMedia = window.matchMedia

    afterEach(() => {
        window.matchMedia = defaultMatchMedia
    })

    it('is true when the device asks for reduced motion', () => {
        mockMatchMedia(true)
        const { result } = renderHook(() => useReducedMotion())

        expect(result.current).toBe(true)
    })

    it('is false otherwise', () => {
        mockMatchMedia(false)
        const { result } = renderHook(() => useReducedMotion())

        expect(result.current).toBe(false)
    })

    it('updates when the setting changes', () => {
        const media = mockMatchMedia(false)
        const { result } = renderHook(() => useReducedMotion())

        act(() => media.setMatches(true))

        expect(result.current).toBe(true)
    })
})
