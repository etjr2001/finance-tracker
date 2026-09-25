import { describe, it, expect } from 'vitest'
import { UtensilsCrossed, ShoppingCart, Bus, Tag } from 'lucide-react'
import { categoryIcon } from '@features/categories/utils/categoryIcon'

describe('categoryIcon', () => {
    it('matches a known keyword', () => {
        expect(categoryIcon('Dining Out')).toBe(UtensilsCrossed)
    })

    it('is case-insensitive', () => {
        expect(categoryIcon('GROCERIES')).toBe(ShoppingCart)
    })

    it('matches a keyword appearing anywhere in the name', () => {
        expect(categoryIcon('Public Transport')).toBe(Bus)
    })

    it('falls back to the shared default for an unrecognized name', () => {
        expect(categoryIcon('Miscellaneous')).toBe(Tag)
    })

    it('falls back to the shared default when name is missing', () => {
        expect(categoryIcon(undefined)).toBe(Tag)
    })
})
