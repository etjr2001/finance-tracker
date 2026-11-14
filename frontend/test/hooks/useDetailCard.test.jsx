import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDetailCard } from '@hooks/useDetailCard'

const item = { id: 1 }

function renderDetailCard() {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const hook = renderHook(() => useDetailCard({ onEdit, onDelete }))
    return { ...hook, onEdit, onDelete }
}

describe('useDetailCard', () => {
    it('starts closed', () => {
        const { result } = renderDetailCard()

        expect(result.current.target).toBeNull()
    })

    it('opens for an item and closes', () => {
        const { result } = renderDetailCard()

        act(() => result.current.open(item))
        expect(result.current.target).toBe(item)

        act(() => result.current.close())
        expect(result.current.target).toBeNull()
    })

    it('edit closes the card and hands the item to onEdit', () => {
        const { result, onEdit } = renderDetailCard()

        act(() => result.current.open(item))
        act(() => result.current.edit())

        expect(result.current.target).toBeNull()
        expect(onEdit).toHaveBeenCalledWith(item)
    })

    it('delete closes the card and hands the item to onDelete', () => {
        const { result, onDelete } = renderDetailCard()

        act(() => result.current.open(item))
        act(() => result.current.delete())

        expect(result.current.target).toBeNull()
        expect(onDelete).toHaveBeenCalledWith(item)
    })
})
