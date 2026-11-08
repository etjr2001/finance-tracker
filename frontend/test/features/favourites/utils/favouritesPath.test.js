import { describe, it, expect } from 'vitest'
import { favouritesPath } from '@features/favourites/utils/favouritesPath'

describe('favouritesPath', () => {
    it('points at the real Favourites page outside demo mode', () => {
        expect(favouritesPath(false)).toBe('/favourites')
    })

    it('stays under /demo in demo mode', () => {
        expect(favouritesPath(true)).toBe('/demo/favourites')
    })
})
