import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@components/Button'

describe('Button', () => {
    it('defaults to type="button" so it never submits a form by accident', () => {
        render(<Button>Save</Button>)

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
    })

    it('accepts an explicit type override', () => {
        render(<Button type="submit">Save</Button>)

        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
    })

    it('calls onClick when clicked', () => {
        const onClick = vi.fn()
        render(<Button onClick={onClick}>Save</Button>)

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when the disabled prop is passed', () => {
        render(<Button disabled>Save</Button>)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('dangerGhost is text-only red, not the solid danger block', () => {
        render(<Button variant="dangerGhost">Delete</Button>)

        const button = screen.getByRole('button', { name: 'Delete' })
        expect(button).toHaveClass('text-withdrawal')
        expect(button).not.toHaveClass('bg-withdrawal')
    })
})
