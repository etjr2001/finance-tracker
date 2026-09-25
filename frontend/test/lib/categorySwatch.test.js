import { describe, it, expect } from 'vitest'
import { categoryTileClasses, categoryBarClass, assignColorKey, COLOR_KEYS } from '@features/categories/utils/categorySwatch'

describe('categoryTileClasses', () => {
    it('returns the tile classes for a known colour key', () => {
        expect(categoryTileClasses('ochre')).toContain('swatch-ochre')
    })

    it('falls back to a fixed default for a null colour key', () => {
        expect(categoryTileClasses(null)).toBe(categoryTileClasses(undefined))
    })

    it('falls back to the same default for an unrecognized colour key', () => {
        expect(categoryTileClasses('not-a-real-key')).toBe(categoryTileClasses(null))
    })
})

describe('categoryBarClass', () => {
    it('uses the same swatch as categoryTileClasses for a given key', () => {
        // tile is "bg-swatch-X/12 text-swatch-X"; bar is "bg-swatch-X" —
        // same swatch name, just without the tint, so the tile's colour
        // word should appear in the bar's class too.
        const swatchWord = categoryTileClasses('teal').match(/text-swatch-(\w+)/)[1]
        expect(categoryBarClass('teal')).toBe(`bg-swatch-${swatchWord}`)
    })

    it('is a solid fill, not the tinted tile background', () => {
        expect(categoryBarClass('rose')).not.toContain('/12')
    })

    it('falls back to a fixed default for a null colour key', () => {
        expect(categoryBarClass(null)).toBe(categoryBarClass(undefined))
    })
})

describe('assignColorKey', () => {
    it('is deterministic: the same name always gets the same key', () => {
        expect(assignColorKey('Groceries')).toBe(assignColorKey('Groceries'))
    })

    it('only ever returns one of the real colour keys', () => {
        expect(COLOR_KEYS).toContain(assignColorKey('Anything'))
    })

    it('gives different names different keys, at least sometimes', () => {
        const names = ['Groceries', 'Rent', 'Dining Out', 'Transport', 'Utilities', 'Entertainment', 'Salary', 'Freelance']
        const results = new Set(names.map(assignColorKey))
        expect(results.size).toBeGreaterThan(1)
    })
})
