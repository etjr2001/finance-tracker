import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddButton from '../../src/components/AddButton'

describe('AddButton', () => {
    it('defaults to the label "Add"', () => {
        render(<AddButton onClick={() => {}} />)

        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('accepts a custom label', () => {
        render(<AddButton onClick={() => {}}>Add category</AddButton>)

        expect(screen.getByRole('button', { name: 'Add category' })).toBeInTheDocument()
    })

    it('forwards props like onClick and type to the underlying Button', () => {
        const onClick = vi.fn()
        render(<AddButton onClick={onClick} type="submit" />)

        const button = screen.getByRole('button', { name: 'Add' })
        expect(button).toHaveAttribute('type', 'submit')

        fireEvent.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
