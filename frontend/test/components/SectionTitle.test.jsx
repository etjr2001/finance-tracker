import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionTitle } from '@components/SectionTitle'

describe('SectionTitle', () => {
    it('renders an h2 in the serif heading style by default', () => {
        render(<SectionTitle>Edit category</SectionTitle>)

        const heading = screen.getByRole('heading', { level: 2, name: 'Edit category' })
        expect(heading).toHaveClass('font-serif', 'font-semibold', 'text-lg')
    })

    it('renders the tag given by `as`, keeping the same style', () => {
        render(<SectionTitle as="h3">Choose month</SectionTitle>)

        const heading = screen.getByRole('heading', { level: 3, name: 'Choose month' })
        expect(heading).toHaveClass('font-serif', 'font-semibold', 'text-lg')
    })

    it('adds spacing classes from className alongside the base style', () => {
        render(<SectionTitle className="mb-4">Drafts to finish</SectionTitle>)

        expect(screen.getByRole('heading')).toHaveClass('mb-4', 'font-serif')
    })
})
