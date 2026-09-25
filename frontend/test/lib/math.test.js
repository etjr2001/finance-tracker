import { describe, it, expect } from 'vitest'
import { percentOf, sum } from '@utils/math'

describe('percentOf', () => {
    it('returns the share as 0–100', () => {
        expect(percentOf(25, 100)).toBe(25)
    })

    it('returns 0 rather than NaN/Infinity when the whole is 0', () => {
        expect(percentOf(5, 0)).toBe(0)
        expect(percentOf(0, 0)).toBe(0)
    })
})

describe('sum', () => {
    it('adds values and treats an empty list as 0', () => {
        expect(sum([1, 2, 3.5])).toBe(6.5)
        expect(sum([])).toBe(0)
    })
})
