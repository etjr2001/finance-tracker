import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '@components/Card'

describe('Card', () => {
    it('renders its children inside a bordered white surface', () => {
        render(<Card>Content</Card>)

        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(screen.getByText('Content')).toHaveClass('bg-paper-raised', 'border-rule')
    })

    // So a new month's cards (and any newly shown card) fade in rather than
    // blink in. A fade isn't movement, so it stays under reduced motion.
    it('fades in when it appears, even under reduced motion', () => {
        render(<Card>Content</Card>)

        expect(screen.getByText('Content')).toHaveClass('animate-fade-in')
        expect(screen.getByText('Content')).not.toHaveClass('motion-safe:animate-fade-in')
    })

    it('has no default padding, so callers set their own via className', () => {
        render(<Card className="p-8">Content</Card>)

        expect(screen.getByText('Content')).toHaveClass('p-8')
        expect(screen.getByText('Content')).not.toHaveClass('p-5')
    })
})
