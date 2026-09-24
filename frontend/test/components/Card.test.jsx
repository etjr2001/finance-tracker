import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../../src/components/Card'

describe('Card', () => {
    it('renders its children inside a bordered white surface', () => {
        render(<Card>Content</Card>)

        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(screen.getByText('Content')).toHaveClass('bg-paper-raised', 'border-rule')
    })
})
