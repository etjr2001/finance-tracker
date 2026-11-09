import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageToolbar } from '@components/PageToolbar'

describe('PageToolbar', () => {
    it('shows its content next to an Add button', () => {
        render(<PageToolbar onAdd={() => {}}>Shortcuts</PageToolbar>)

        expect(screen.getByText('Shortcuts')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('calls onAdd when Add is clicked', () => {
        const onAdd = vi.fn()
        render(<PageToolbar onAdd={onAdd}>Shortcuts</PageToolbar>)

        fireEvent.click(screen.getByRole('button', { name: 'Add' }))

        expect(onAdd).toHaveBeenCalledTimes(1)
    })
})
