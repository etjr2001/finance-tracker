import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import { useSelectedMonth } from '../../src/hooks/useSelectedMonth'

function wrapper(initialEntry) {
    return ({ children }) => <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
}

describe('useSelectedMonth', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('defaults to the current month when ?month= is absent', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 8, 15))

        const { result } = renderHook(() => useSelectedMonth(), { wrapper: wrapper('/transactions') })

        expect(result.current[0]).toBe('2026-09')
    })

    it('reads a valid ?month= from the URL', () => {
        const { result } = renderHook(() => useSelectedMonth(), { wrapper: wrapper('/transactions?month=2026-03') })

        expect(result.current[0]).toBe('2026-03')
    })

    it('falls back to the current month when ?month= is invalid', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 8, 15))

        const { result } = renderHook(() => useSelectedMonth(), { wrapper: wrapper('/transactions?month=garbage') })

        expect(result.current[0]).toBe('2026-09')
    })

    it('updates the URL when setMonth is called', () => {
        const { result } = renderHook(() => useSelectedMonth(), { wrapper: wrapper('/transactions?month=2026-03') })

        act(() => result.current[1]('2026-05'))

        expect(result.current[0]).toBe('2026-05')
    })

    it('preserves other existing search params when setting the month', () => {
        function useCombined() {
            const [month, setMonth] = useSelectedMonth()
            const [searchParams] = useSearchParams()
            return { month, setMonth, foo: searchParams.get('foo') }
        }

        const { result } = renderHook(() => useCombined(), { wrapper: wrapper('/transactions?foo=bar&month=2026-03') })

        act(() => result.current.setMonth('2026-05'))

        expect(result.current.month).toBe('2026-05')
        expect(result.current.foo).toBe('bar')
    })
})
