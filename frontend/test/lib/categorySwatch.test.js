import { describe, it, expect } from 'vitest'
import { categoryTileClasses, categoryBarClass } from '../../src/lib/categorySwatch'

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

describe('categoryBarClass', () => {
    it('is deterministic, like categoryTileClasses', () => {
        expect(categoryBarClass(7)).toBe(categoryBarClass(7))
    })

    it('uses the same swatch as categoryTileClasses for a given id', () => {
        // tile is "bg-swatch-X/12 text-swatch-X"; bar is "bg-swatch-X" —
        // same swatch name, just without the tint, so the tile's colour
        // word should appear in the bar's class too.
        const swatchWord = categoryTileClasses(4).match(/text-swatch-(\w+)/)[1]
        expect(categoryBarClass(4)).toBe(`bg-swatch-${swatchWord}`)
    })

    it('is a solid fill, not the tinted tile background', () => {
        expect(categoryBarClass(1)).not.toContain('/12')
    })
})
