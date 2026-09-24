import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../../src/components/Card'

describe('Card', () => {
    it('renders its children inside a bordered white surface', () => {
        render(<Card>Content</Card>)

        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(screen.getByText('Content')).toHaveClass('bg-paper-raised', 'border-rule')
    })

    it('has no default padding, so callers set their own via className', () => {
        render(<Card className="p-8">Content</Card>)

        expect(screen.getByText('Content')).toHaveClass('p-8')
        expect(screen.getByText('Content')).not.toHaveClass('p-5')
    })
})
