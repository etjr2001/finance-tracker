import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@hooks/useIsMobile'

// A minimal fake matchMedia that actually supports the addEventListener
// change-event path, so the hook's reactivity can be tested — the global
// setup.js polyfill only supports a fixed value.
function mockMatchMedia(initialMatches) {
    let matches = initialMatches
    let listener = null
    window.matchMedia = vi.fn().mockImplementation(() => ({
        get matches() {
            return matches
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

describe('useIsMobile', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('is false when the desktop media query matches', () => {
        mockMatchMedia(true)
        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)
    })

    it('is true when the desktop media query does not match', () => {
        mockMatchMedia(false)
        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(true)
    })

    it('updates reactively when the media query changes', () => {
        const media = mockMatchMedia(true)
        const { result } = renderHook(() => useIsMobile())

        expect(result.current).toBe(false)

        act(() => media.setMatches(false))

        expect(result.current).toBe(true)
    })
})
