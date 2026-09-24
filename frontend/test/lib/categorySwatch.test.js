import { describe, it, expect } from 'vitest'
import { categoryTileClasses } from '../../src/lib/categorySwatch'

describe('categoryTileClasses', () => {
    it('is deterministic: the same id always gets the same classes', () => {
        expect(categoryTileClasses(7)).toBe(categoryTileClasses(7))
    })

    it('gives different ids different classes, at least sometimes', () => {
        const results = new Set(Array.from({ length: 9 }, (_, i) => categoryTileClasses(i)))
        expect(results.size).toBeGreaterThan(1)
    })

    it('wraps around once ids exceed the number of swatches', () => {
        // 9 swatches, so id 0 and id 9 land on the same one.
        expect(categoryTileClasses(0)).toBe(categoryTileClasses(9))
    })

    it('handles a numeric-string id the same as a number', () => {
        expect(categoryTileClasses('3')).toBe(categoryTileClasses(3))
    })
})
