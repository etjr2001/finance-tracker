import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFieldHelp } from '@hooks/useFieldHelp'

describe('useFieldHelp', () => {
    it('gives no (i) props without help, and shows the helper', () => {
        const { result } = renderHook(() => useFieldHelp({ id: 'amount', helper: 'Short' }))

        expect(result.current.labelProps).toEqual({})
        expect(result.current.note).toBe('Short')
        expect(result.current.noteId).toBeUndefined()
        expect(result.current.describedBy).toBeUndefined()
    })

    it('starts closed: the helper shows and nothing is linked', () => {
        const { result } = renderHook(() => useFieldHelp({ id: 'amount', help: 'Full', helper: 'Short' }))

        expect(result.current.labelProps).toMatchObject({ helpId: 'amount-help', isHelpOpen: false })
        expect(result.current.note).toBe('Short')
        expect(result.current.describedBy).toBeUndefined()
    })

    it('shows the help in place of the helper once toggled open, and links it', () => {
        const { result } = renderHook(() => useFieldHelp({ id: 'amount', help: 'Full', helper: 'Short' }))

        act(() => result.current.labelProps.onToggleHelp())

        expect(result.current.labelProps.isHelpOpen).toBe(true)
        expect(result.current.note).toBe('Full')
        expect(result.current.noteId).toBe('amount-help')
        expect(result.current.describedBy).toBe('amount-help')
    })

    it('goes back to the helper on a second toggle', () => {
        const { result } = renderHook(() => useFieldHelp({ id: 'amount', help: 'Full', helper: 'Short' }))

        act(() => result.current.labelProps.onToggleHelp())
        act(() => result.current.labelProps.onToggleHelp())

        expect(result.current.note).toBe('Short')
        expect(result.current.describedBy).toBeUndefined()
    })
})
