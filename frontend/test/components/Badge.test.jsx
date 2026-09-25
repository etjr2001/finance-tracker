import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@components/Badge'

describe('Badge', () => {
    it('renders its children', () => {
        render(<Badge>Draft</Badge>)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('defaults to the brass tone', () => {
        render(<Badge>Draft</Badge>)

        expect(screen.getByText('Draft')).toHaveClass('text-brass-ink')
    })

    it('applies the requested tone', () => {
        render(<Badge tone="withdrawal">Overdue</Badge>)

        expect(screen.getByText('Overdue')).toHaveClass('text-withdrawal')
    })
})
